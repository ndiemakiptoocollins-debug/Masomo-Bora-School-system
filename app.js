const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let state={user:null,data:null,page:'dashboard'};
const api=async(url,opts={})=>{const r=await fetch('/api'+url,{headers:{'Content-Type':'application/json'},...opts});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'Request failed');return d};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast=m=>{let t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)};
const opts=(arr,label='name')=>arr.map(x=>`<option value="${x.id}">${esc(x[label])}</option>`).join('');
const table=(heads,rows)=>`<div class="table-wrap"><table><thead><tr>${heads.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.join(''):`<tr><td class="empty" colspan="${heads.length}">No records yet.</td></tr>`}</tbody></table></div>`;
const formField=(label,name,type='text',extra='')=>`<label>${label}<input name="${name}" type="${type}" ${extra}></label>`;
const selectField=(label,name,options,placeholder='Select...')=>`<label>${label}<select name="${name}" required><option value="">${placeholder}</option>${options}</select></label>`;
async function refresh(){state.data=await api('/bootstrap');}
function showApp(){ $('#login').classList.add('hidden');$('#app').classList.remove('hidden');$('#userName').textContent=state.user.email;$('#userRole').textContent='ADMIN';$('#content').innerHTML=`<div class="panel"><h3>Welcome to Masomo Bora</h3><p>Your administrator account has signed in successfully.</p><p class="muted">Your secure sign-in is connected. We are now building the school database features and connecting each dashboard section one at a time.</p><div class="quick-grid"><div class="tile"><span class="ico">▦</span><b>Class timetable</b><small>Next feature to connect</small></div><div class="tile"><span class="ico">▤</span><b>Report cards</b><small>Coming after timetable</small></div></div></div>`;}
function go(page){state.page=page;$$('.nav').forEach(b=>b.classList.toggle('active',b.dataset.page===page));render();}
$('#nav').addEventListener('click',e=>{let b=e.target.closest('[data-page]');if(b){e.preventDefault();document.querySelector('.sidebar').classList.remove('sidebar-open');$('#sidebarBackdrop').classList.remove('show');$('#menuToggle').setAttribute('aria-expanded','false');toast('This section is being connected. The timetable is our next build.')}});

const themeSelect=$('#themeSelect');
const applyTheme=mode=>{
  const systemLight=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches;
  document.documentElement.dataset.theme=(mode==='system'?(systemLight?'light':'dark'):mode);
  if(themeSelect)themeSelect.value=mode;
};
let savedTheme='system';
try{savedTheme=localStorage.getItem('masomo-bora-theme')||'system'}catch(e){}
applyTheme(savedTheme);
if(themeSelect)themeSelect.addEventListener('change',()=>{
  savedTheme=themeSelect.value;
  try{localStorage.setItem('masomo-bora-theme',savedTheme)}catch(e){}
  applyTheme(savedTheme);
});
if(window.matchMedia){
  const colorScheme=window.matchMedia('(prefers-color-scheme: light)');
  const updateSystemTheme=()=>{if(savedTheme==='system')applyTheme('system')};
  if(colorScheme.addEventListener)colorScheme.addEventListener('change',updateSystemTheme);
  else if(colorScheme.addListener)colorScheme.addListener(updateSystemTheme);
}
const toggleSidebar=()=>{
  const open=document.querySelector('.sidebar').classList.toggle('sidebar-open');
  $('#sidebarBackdrop').classList.toggle('show',open);
  $('#menuToggle').setAttribute('aria-expanded',String(open));
};
$('#menuToggle').addEventListener('click',toggleSidebar);
$('#sidebarBackdrop').addEventListener('click',()=>{
  document.querySelector('.sidebar').classList.remove('sidebar-open');
  $('#sidebarBackdrop').classList.remove('show');
  $('#menuToggle').setAttribute('aria-expanded','false');
});
$('#logout').onclick=async()=>{const {error}=await supabaseClient.auth.signOut();if(error){toast(error.message);return}state.user=null;$('#app').classList.add('hidden');$('#login').classList.remove('hidden')};
$('#loginForm').onsubmit=async e=>{e.preventDefault();$('#loginError').textContent='';const button=$('#loginForm button[type=submit]')||$('#loginForm button');button.disabled=true;try{const f=new FormData(e.target);const {data,error}=await supabaseClient.auth.signInWithPassword({email:f.get('email'),password:f.get('password')});if(error)throw error;state.user={email:data.user.email};showApp()}catch(err){$('#loginError').textContent=err.message||'Unable to sign in.'}finally{button.disabled=false}};
async function render(){if(!state.data)await refresh();const p=state.page;const titles={dashboard:'Administrator Dashboard',learners:'Learner Management',classes:'Classes & Terms',subjects:'Curriculum Subjects',users:'Users & Staff',exams:'Examination Setup',marks:'Marks Management',results:'Results & Merit Lists',attendance:'Attendance Tracking',timetable:'Timetable Management',finance:'Fees & Payments',announcements:'Communication & Announcements',reports:'Academic Reports'};$('#pageTitle').textContent=titles[p]||'Dashboard';const d=state.data,c=$('#content');const admin=state.user.role==='admin';
if(p==='dashboard'){c.innerHTML=`<div class="stats"><div class="stat blue"><span>ACTIVE LEARNERS</span><strong>${d.stats.learners}</strong></div><div class="stat green"><span>TEACHING STAFF</span><strong>${d.stats.staff}</strong></div><div class="stat cyan"><span>ACTIVE CLASSES</span><strong>${d.stats.classes}</strong></div><div class="stat gold"><span>EXAMINATIONS</span><strong>${d.stats.exams}</strong></div></div><div class="section-head"><div><h3>School Administration</h3><p>Manage your school's daily academic activities.</p></div></div><div class="quick-grid">${[['♙','Learners','Register and manage learners','learners'],['▤','Classes','Organise grade levels','classes'],['✎','Enter Marks','Record assessment scores','marks'],['🏆','Merit Lists','Review class rankings','results'],['◷','Attendance','Track daily attendance','attendance'],['▦','Timetables','Manage class schedules','timetable'],['KSh','School Finance','Invoices and payments','finance'],['◉','Announcements','Communicate with families','announcements']].map(x=>`<button class="tile" data-go="${x[3]}"><span class="ico">${x[0]}</span><b>${x[1]}</b><small>${x[2]}</small></button>`).join('')}</div><div class="panel" style="margin-top:20px"><h3>Recent announcements</h3>${d.announcements.length?d.announcements.slice(0,4).map(a=>`<p><b>${esc(a.title)}</b><br><span class="muted">${esc(a.message)}</span></p>`).join(''):'<p class="muted">No announcements published yet.</p>'}</div>`}
else if(p==='learners'){c.innerHTML=`<div class="section-head"><div><h3>Learner register</h3><p>Maintain learner admission and guardian details.</p></div><button class="btn primary" id="toggleForm">+ Add learner</button></div><div id="formArea"></div>${table(['Admission No.','Learner name','Class','Gender','Guardian','Status',''],d.learners.map(l=>`<tr><td>${esc(l.admission_no)}</td><td><b>${esc(l.full_name)}</b></td><td>${esc(l.class_name||'—')}</td><td>${esc(l.gender||'—')}</td><td>${esc(l.guardian||'—')}</td><td><span class="badge">${esc(l.status)}</span></td><td>${admin?`<button class="btn small danger" data-delete="learners" data-id="${l.id}">Delete</button>`:''}</td></tr>`))}`;$('#toggleForm').onclick=()=>formArea.innerHTML=`<div class="form-card"><h3>Register learner</h3><form id="learnerForm" class="form-grid">${formField('Admission number','admission_no')}${formField('Full name','full_name')}${selectField('Class','class_id',opts(d.classes))}${selectField('Gender','gender',['Male','Female'].map(x=>`<option>${x}</option>`).join(''))}${formField('Guardian name','guardian')}${formField('Guardian phone','guardian_phone','tel')}${selectField('Status','status',['Active','Inactive'].map(x=>`<option>${x}</option>`).join(''))}<div class="form-actions"><button class="btn primary">Save learner</button></div></form></div>`;bindForm('learnerForm','/learners')}
else if(p==='classes'||p==='subjects'||p==='exams'||p==='users'||p==='announcements'){const cfg={classes:{title:'Classes',route:'classes',fields:[['Class name','name'],['Level','level']],heads:['Class','Level']},subjects:{title:'Subjects',route:'subjects',fields:[['Subject code','code'],['Subject name','name']],heads:['Code','Subject']},exams:{title:'Examinations',route:'exams',fields:[['Exam name','name'],['Term','term'],['Year','year','number'],['Maximum score','max_score','number']],heads:['Exam','Term','Year','Maximum']},users:{title:'System users',route:'users',fields:[['Username','username'],['Full name','full_name'],['Role','role','select:admin,teacher,student,parent'],['Temporary password','password','password']],heads:['Username','Full name','Role','Active']},announcements:{title:'Announcements',route:'announcements',fields:[['Title','title'],['Message','message'],['Audience','audience','select:All,Teachers,Parents,Students']],heads:['Title','Message','Audience']}}[p];let rows=(await api('/'+cfg.route)).map(x=>`<tr>${cfg.fields.map(f=>`<td>${esc(x[f[1]])}</td>`).join('')}${p==='users'?`<td>${x.active?'Yes':'No'}</td>`:''}<td>${admin?`<button class="btn small danger" data-delete="${cfg.route}" data-id="${x.id}">Delete</button>`:''}</td></tr>`);c.innerHTML=`<div class="section-head"><div><h3>${cfg.title}</h3><p>Configure and maintain ${cfg.title.toLowerCase()}.</p></div>${admin?'<button class="btn primary" id="toggleForm">+ Add new</button>':''}</div><div id="formArea"></div>${table([...cfg.heads,''],rows)}`;if(admin)$('#toggleForm').onclick=()=>{formArea.innerHTML=`<div class="form-card"><h3>Add ${cfg.title.toLowerCase()}</h3><form id="genericForm" class="form-grid">${cfg.fields.map(f=>f[2]?.startsWith('select:')?`<label>${f[0]}<select name="${f[1]}">${f[2].slice(7).split(',').map(v=>`<option>${v}</option>`).join('')}</select></label>`:formField(f[0],f[1],f[2]||'text')).join('')}<div class="form-actions"><button class="btn primary">Save</button></div></form></div>`;bindForm('genericForm','/'+cfg.route)}}
else if(p==='marks'){c.innerHTML=`<div class="section-head"><div><h3>Enter assessment marks</h3><p>Scores are validated against the examination maximum.</p></div></div><div class="form-card"><form id="markForm" class="form-grid">${selectField('Learner','learner_id',opts(d.learners,'full_name'))}${selectField('Subject','subject_id',opts(d.subjects))}${selectField('Examination','exam_id',opts(d.exams))}${formField('Score','score','number','min="0" step="0.01" required')}<div class="form-actions"><button class="btn primary">Save / update mark</button></div></form></div>${table(['Learner','Class','Subject','Exam','Score',''],(await api('/marks')).map(m=>`<tr><td>${esc(m.learner_name)}</td><td>${esc(m.class_name||'—')}</td><td>${esc(m.subject_name)}</td><td>${esc(m.exam_name)}</td><td><b>${m.score}/${m.max_score}</b></td><td>${admin?`<button class="btn small danger" data-delete="marks" data-id="${m.id}">Delete</button>`:''}</td></tr>`))}`;bindForm('markForm','/marks')}
else if(p==='results'){c.innerHTML=`<div class="section-head"><div><h3>Results and merit lists</h3><p>Rank learners by average score for a selected examination.</p></div></div><div class="form-card"><label>Choose examination<select id="resultExam">${opts(d.exams)}</select></label><div id="resultArea" style="margin-top:15px"></div></div>`;$('#resultExam').onchange=loadResults;if(d.exams.length)loadResults()}
else if(p==='attendance'){c.innerHTML=`<div class="section-head"><div><h3>Daily attendance</h3><p>Record Present, Absent, Late or Excused status.</p></div></div><div class="form-card"><form id="attendanceForm" class="form-grid">${selectField('Learner','learner_id',opts(d.learners,'full_name'))}${formField('Date','date','date','required')}${selectField('Status','status',['Present','Absent','Late','Excused'].map(x=>`<option>${x}</option>`).join(''))}${formField('Note (optional)','note')}<div class="form-actions"><button class="btn primary">Save attendance</button></div></form></div>${table(['Date','Admission','Learner','Status','Note'],(await api('/attendance')).map(a=>`<tr><td>${a.date}</td><td>${esc(a.admission_no)}</td><td>${esc(a.learner_name)}</td><td><span class="badge ${a.status==='Absent'?'red':a.status==='Late'?'warn':''}">${a.status}</span></td><td>${esc(a.note)}</td></tr>`))}`;bindForm('attendanceForm','/attendance')}
else if(p==='timetable'){let rows=await api('/timetable');c.innerHTML=`<div class="section-head"><div><h3>Class timetable</h3><p>Create and view weekly lesson schedules.</p></div>${admin?'<button class="btn primary" id="toggleForm">+ Add lesson</button>':''}</div><div id="formArea"></div>${table(['Class','Day','Period','Subject','Teacher','Room',''],rows.map(t=>`<tr><td>${esc(t.class_name)}</td><td>${esc(t.day)}</td><td>${esc(t.period)}</td><td>${esc(t.subject_name)}</td><td>${esc(t.teacher_name||'—')}</td><td>${esc(t.room||'—')}</td><td>${admin?`<button class="btn small danger" data-delete="timetable" data-id="${t.id}">Delete</button>`:''}</td></tr>`))}`;if(admin)$('#toggleForm').onclick=async()=>{let teachers=await api('/teachers');formArea.innerHTML=`<div class="form-card"><h3>Add timetable lesson</h3><form id="ttForm" class="form-grid">${selectField('Class','class_id',opts(d.classes))}${selectField('Day','day',['Monday','Tuesday','Wednesday','Thursday','Friday'].map(x=>`<option>${x}</option>`).join(''))}${formField('Period','period','text','placeholder="e.g. 8:20–9:00" required')}${selectField('Subject','subject_id',opts(d.subjects))}${selectField('Teacher','teacher_id',teachers.map(t=>`<option value="${t.id}">${esc(t.full_name)}</option>`).join(''),'Unassigned')}${formField('Room','room')}<div class="form-actions"><button class="btn primary">Save lesson</button></div></form></div>`;bindForm('ttForm','/timetable')}}
else if(p==='finance'){let [invoices]=await Promise.all([api('/invoices')]);c.innerHTML=`<div class="section-head"><div><h3>Fees, invoices and payments</h3><p>Track billed amounts and payments recorded by the school.</p></div></div>${admin?`<div class="form-card"><h3>Create fee invoice</h3><form id="invoiceForm" class="form-grid">${selectField('Learner','learner_id',opts(d.learners,'full_name'))}${formField('Description','description','text','placeholder="e.g. Term 1 fees" required')}${formField('Amount (KSh)','amount','number','min="1" required')}${formField('Due date','due_date','date')}<div class="form-actions"><button class="btn primary">Create invoice</button></div></form></div>`:''}${table(['Learner','Description','Amount','Paid','Balance','Status',''],invoices.map(i=>{let bal=i.amount-i.paid;return `<tr><td>${esc(i.learner_name)}</td><td>${esc(i.description)}</td><td>KSh ${Number(i.amount).toLocaleString()}</td><td>KSh ${Number(i.paid).toLocaleString()}</td><td>KSh ${bal.toLocaleString()}</td><td><span class="badge ${bal?'warn':''}">${i.status}</span></td><td>${admin&&bal?`<button class="btn small green" data-pay="${i.id}" data-balance="${bal}">Record payment</button>`:''}</td></tr>`}))}`;if($('#invoiceForm'))bindForm('invoiceForm','/invoices');$$('[data-pay]').forEach(b=>b.onclick=async()=>{let amount=prompt('Payment amount (KSh). Outstanding: '+b.dataset.balance);if(amount===null)return;let method=prompt('Payment method (M-Pesa, Bank, Cash):','M-Pesa');if(!method)return;try{await api('/payments',{method:'POST',body:JSON.stringify({invoice_id:b.dataset.pay,amount:Number(amount),method})});toast('Payment recorded');render()}catch(e){toast(e.message)}})}
else if(p==='reports'){let r=await api('/reports/summary');c.innerHTML=`<div class="section-head"><div><h3>School performance overview</h3><p>Summary based on recorded school data.</p></div></div><div class="stats"><div class="stat blue"><span>MARKS RECORDED</span><strong>${r.marks.count}</strong></div><div class="stat green"><span>AVERAGE SCORE</span><strong>${r.marks.average??'—'}</strong></div><div class="stat cyan"><span>ATTENDANCE RECORDS</span><strong>${r.attendance.reduce((a,x)=>a+x.count,0)}</strong></div><div class="stat gold"><span>FEE INVOICES</span><strong>${r.fees.reduce((a,x)=>a+x.count,0)}</strong></div></div><div class="panel-grid"><div class="panel"><h3>Attendance breakdown</h3>${r.attendance.map(x=>`<p>${esc(x.status)} <b style="float:right">${x.count}</b></p>`).join('')||'<p class="muted">No attendance data yet.</p>'}</div><div class="panel"><h3>Fee invoice summary</h3>${r.fees.map(x=>`<p>${esc(x.status)} <b style="float:right">KSh ${Number(x.amount).toLocaleString()}</b></p>`).join('')||'<p class="muted">No invoices yet.</p>'}</div></div>`}
$$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
$$('[data-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('Delete this record?'))return;try{await api('/'+b.dataset.delete+'/'+b.dataset.id,{method:'DELETE'});await refresh();toast('Record deleted');render()}catch(e){toast(e.message)}});
}
function bindForm(id,route){const f=$('#'+id);if(!f)return;f.onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(f));try{await api(route,{method:'POST',body:JSON.stringify(data)});await refresh();toast('Saved successfully');render()}catch(err){toast(err.message)}}}
async function loadResults(){const id=$('#resultExam').value;if(!id)return;const rows=await api('/results/'+id);$('#resultArea').innerHTML=table(['Position','Admission','Learner','Class','Subjects','Total','Average'],rows.map(r=>`<tr><td><b>${r.position}</b></td><td>${esc(r.admission_no)}</td><td>${esc(r.full_name)}</td><td>${esc(r.class_name||'—')}</td><td>${r.subjects}</td><td>${r.total??0}</td><td><span class="badge">${r.average??0}%</span></td></tr>`))}
const supabaseClient=window.supabase.createClient('https://zthxasclhlrajhuciivn.supabase.co','sb_publishable_RtolIOm-YGGLAbjde-diyg_P9CfzJWf');
(async()=>{try{const {data,error}=await supabaseClient.auth.getSession();if(error)throw error;if(data.session){if(location.hash.includes('type=recovery')){showPasswordResetForm();return}state.user={email:data.session.user.email};showApp()}}catch(e){console.error('Session check failed',e)}})();
supabaseClient.auth.onAuthStateChange((_event,session)=>{if(!session){state.user=null;$('#app').classList.add('hidden');$('#login').classList.remove('hidden')}});


// Password recovery: send a reset email and let Supabase return to this hosted page.
function showPasswordResetForm(){
  $('#login').classList.remove('hidden');
  $('#app').classList.add('hidden');
  $('#loginForm').classList.add('hidden');
  $('#forgotPasswordLink').classList.add('hidden');
  $('#resetPasswordForm').classList.remove('hidden');
  $('#loginError').textContent='';
}
$('#forgotPasswordLink').onclick=async()=>{
  const email=$('#loginForm').elements.email.value.trim();
  $('#loginError').textContent='';
  if(!email){$('#loginError').textContent='Enter your email address first.';$('#loginForm').elements.email.focus();return}
  const button=$('#forgotPasswordLink');button.disabled=true;
  try{
    const {error}=await supabaseClient.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+window.location.pathname});
    if(error)throw error;
    $('#loginError').textContent='Password reset email sent. Check your inbox and open the reset link on this device.';
  }catch(err){$('#loginError').textContent=err.message||'Could not send the reset email.'}
  finally{button.disabled=false}
};
$('#showResetPasswords').onchange=e=>{
  const type=e.target.checked?'text':'password';
  $('#newPassword').type=type;
  $('#confirmPassword').type=type;
};
$('#resetPasswordForm').onsubmit=async e=>{
  e.preventDefault();
  const password=$('#newPassword').value;
  const confirm=$('#confirmPassword').value;
  $('#resetPasswordError').textContent='';
  if(password.length<6){$('#resetPasswordError').textContent='Use a password with at least 6 characters.';return}
  if(password!==confirm){$('#resetPasswordError').textContent='The passwords do not match.';return}
  const button=$('#resetPasswordForm button[type=submit]');button.disabled=true;
  try{
    const {error}=await supabaseClient.auth.updateUser({password});
    if(error)throw error;
    await supabaseClient.auth.signOut();
    $('#resetPasswordForm').classList.add('hidden');
    $('#loginForm').classList.remove('hidden');
    $('#forgotPasswordLink').classList.remove('hidden');
    $('#loginError').textContent='Your password has been updated. Sign in with your new password.';
    history.replaceState(null,'',window.location.pathname);
  }catch(err){$('#resetPasswordError').textContent=err.message||'Could not update your password.'}
  finally{button.disabled=false}
};
supabaseClient.auth.onAuthStateChange((event)=>{
  if(event==='PASSWORD_RECOVERY')showPasswordResetForm();
});
if(location.hash.includes('type=recovery'))showPasswordResetForm();
