import { firebaseConfig, editorUids } from './firebase-config.js';

const ui = window.milestoneSync;
const el = {
  title: document.getElementById('syncTitle'),
  detail: document.getElementById('syncDetail'),
  identity: document.getElementById('syncIdentity'),
  signIn: document.getElementById('signIn'),
  signOut: document.getElementById('signOut'),
  importLocal: document.getElementById('publishLocal')
};
const status=(title,detail)=>{el.title.textContent=title;el.detail.textContent=detail;};
function friendly(err) {
  if (err?.code==='permission-denied') return 'Permission denied. Check editor UIDs and Firestore rules.';
  if (err?.code==='auth/unauthorized-domain') return 'Add khutchings85.github.io in Firebase Authentication authorized domains.';
  return String(err?.message||err?.code||err||'Unknown error').slice(0,180);
}
if (!firebaseConfig?.apiKey || !firebaseConfig?.projectId || !firebaseConfig?.appId) {
  status('Saved in this browser','Cloud syncing is not configured yet. See the Firebase setup guide in the repository.');
} else {
  ui.start();
  status('Connecting…','Connecting to the family milestone database.');
  connect().catch(err=>{
    ui.setEditor(false);
    status('Cloud setup error',friendly(err));
  });
}
async function connect() {
  const [
    {initializeApp},
    {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged},
    {getFirestore,collection,doc,onSnapshot,setDoc,writeBatch,serverTimestamp}
  ] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js')
  ]);
  const app=initializeApp(firebaseConfig);
  const auth=getAuth(app), db=getFirestore(app), records=collection(db,'milestones');
  let user=null, isEditor=false, cloudGoals={}, cloudCount=0, hasSnapshot=false;
  function refreshAccess() {
    isEditor=!!user && editorUids.includes(user.uid);
    ui.setEditor(isEditor);
    el.signIn.hidden=!!user;
    el.signOut.hidden=!user;
    el.importLocal.hidden=!isEditor;
    el.identity.textContent=user
      ? 'Signed in: '+(user.email||'Google account')+' • Firebase UID: '+user.uid+
        (isEditor?' • Editing enabled':' • Viewer only')
      : 'Public viewing. Sign in with an approved Google account to edit.';
    if(hasSnapshot) status('Shared milestone progress',isEditor?'Connected — edits automatically sync.':'Connected — viewing shared progress.');
  }
  el.signIn.addEventListener('click',async()=>{
    try{await signInWithPopup(auth,new GoogleAuthProvider());}
    catch(err){status('Sign-in failed',friendly(err));}
  });
  el.signOut.addEventListener('click',async()=>{
    try{await signOut(auth);}catch(err){status('Sign-out failed',friendly(err));}
  });
  onAuthStateChanged(auth,next=>{user=next;refreshAccess();},err=>status('Authentication error',friendly(err)));
  onSnapshot(records,snapshot=>{
    hasSnapshot=true;
    cloudGoals={};cloudCount=snapshot.size;
    snapshot.forEach(item=>{if(ui.goals.includes(item.id))cloudGoals[item.id]=item.data();});
    ui.applyGoals(cloudGoals);
    refreshAccess();
    if(cloudCount===0)el.detail.textContent+=' No cloud progress yet; an editor may import browser progress.';
  },err=>{
    ui.setEditor(false);
    status('Cloud read failed',friendly(err));
  });
  async function writeOne(id,p) {
    if(!isEditor||!user) throw Error('Not authorized to edit');
    if(!ui.goals.includes(id)) throw Error('Unknown milestone');
    const n=Number(p?.value);
    if(!Number.isFinite(n)||n<0||n>100000000) throw Error('Invalid amount');
    await setDoc(doc(records,id),{
      value:n,done:p?.done===true,reward:String(p?.reward??'').slice(0,300),
      updatedAt:serverTimestamp(),updatedBy:user.uid
    });
  }
  window.addEventListener('milestone-cloud-update',async event=>{
    try{
      status('Saving…','Updating shared milestones.');
      await writeOne(event.detail.id,event.detail.progress);
      status('Saved to cloud','Other devices will see this update.');
    }catch(err){
      ui.applyGoals(cloudGoals);
      status('Save failed',friendly(err));
    }
  });
  async function writeAll(goals) {
    if(!isEditor||!user) throw Error('Not authorized to edit');
    const batch=writeBatch(db);
    for(const id of ui.goals) {
      const p=goals[id]||{};
      const n=Number(p.value||0);
      if(!Number.isFinite(n)||n<0||n>100000000)throw Error('Invalid amount');
      batch.set(doc(records,id),{
        value:n,done:p.done===true,reward:String(p.reward??'').slice(0,300),
        updatedAt:serverTimestamp(),updatedBy:user.uid
      });
    }
    await batch.commit();
  }
  async function publish(goals) {
    if(!isEditor)return;
    if(!confirm(cloudCount>0
      ? 'Replace ALL six shared milestones with these values?'
      : 'Publish this browser\'s saved milestones to the shared dashboard?'))return;
    try{
      status('Publishing…','Uploading all six milestones.');
      await writeAll(goals);
      status('Published','Everyone will see the updated milestones.');
    }catch(err){ui.applyGoals(cloudGoals);status('Publish failed',friendly(err));}
  }
  el.importLocal.addEventListener('click',()=>{
    const local=ui.local(),current=ui.current();
    const goals=Object.fromEntries(ui.goals.map(id=>[id,local[id]||current[id]]));
    publish(goals);
  });
  window.addEventListener('milestone-cloud-import',e=>publish(e.detail.goals));
}
