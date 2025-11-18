(function(){
  // === Styles ===
  const style = document.createElement('style');
  style.innerHTML = `
    :root{--blue:#2f6df6;--accent:#3b82f6;--bg:#f6f8fb;--bubble:#e6eefc}
    *{box-sizing:border-box}
    .chat-launcher{position:fixed;right:20px;bottom:20px;z-index:9999}
    .chat-btn{width:56px;height:56px;border-radius:50%;background:linear-gradient(180deg,var(--blue),#234ed6);
      display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(15,23,42,.25);border:none;cursor:pointer;font-size:24px;color:#fff}
    .chat-window{width:360px;max-width:calc(100vw - 40px);height:520px;background:#fff;border-radius:16px;
      box-shadow:0 20px 50px rgba(2,6,23,.25);overflow:hidden;display:flex;flex-direction:column}
    .chat-header{background:var(--blue);color:#fff;padding:12px 14px;display:flex;align-items:center;justify-content:space-between}
    .chat-header h3{margin:0;font-size:14px}
    .chat-header .close{background:transparent;border:0;color:#fff;font-size:20px;cursor:pointer}
    .chat-body{padding:16px;flex:1;overflow:auto;background:linear-gradient(180deg,#fbfdff,#f7f9ff)}
    .msg-row{display:flex;margin-bottom:10px}
    .msg-row.bot{justify-content:flex-start}
    .msg-row.user{justify-content:flex-end}
    .bubble{max-width:75%;padding:10px 14px;border-radius:18px;font-size:13px;line-height:1.3;box-shadow:0 6px 14px rgba(15,23,42,.06)}
    .bubble.bot{background:var(--bubble);color:#0f172a;border-top-left-radius:6px}
    .bubble.user{background:var(--blue);color:#fff;border-top-right-radius:6px}
    .options{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}
    .opt-btn{background:#fff;border:1px solid #e5e7eb;padding:8px 12px;border-radius:999px;font-size:12px;
      cursor:pointer;box-shadow:0 6px 12px rgba(2,6,23,.04)}
    .enquiry-form{margin-top:8px;background:#fff;padding:10px;border-radius:10px;border:1px solid #eef2ff}
    .enquiry-form input{width:100%;padding:8px;border:1px solid #e6eefc;border-radius:8px;margin-bottom:8px;font-size:13px}
    .enquiry-form button{width:100%;padding:10px;border-radius:8px;border:0;background:var(--accent);color:#fff;font-weight:600;cursor:pointer}
  `;
  document.head.appendChild(style);

  // === Launcher ===
  const launcher = document.createElement('div');
  launcher.className = 'chat-launcher';
  launcher.innerHTML = `<button id="open-chat" aria-label="Open chat" class="chat-btn">💬</button>`;
  document.body.appendChild(launcher);

  const INITIAL_BOT = {
    text: 'Hello there! 👋 How can we help you today?',
    options: ['Book Appointment', 'General Enquiry', 'Doctor & Clinic Info']
  };
  let chatWindow = null;

  function createChat(){
    if(chatWindow) return;
    chatWindow = document.createElement('div');
    chatWindow.className = 'chat-window';
    chatWindow.innerHTML = `
      <div class="chat-header">
        <h3>Asha - AI Assistant</h3>
        <button class="close">×</button>
      </div>
      <div class="chat-body" id="chat-body"></div>
    `;
    launcher.appendChild(chatWindow);
    chatWindow.querySelector('.close').addEventListener('click', closeChat);
    appendBotMessage(INITIAL_BOT.text, INITIAL_BOT.options);
  }

  function closeChat(){launcher.removeChild(chatWindow);chatWindow=null;}

  function appendBotMessage(text, options){
    const body=document.getElementById('chat-body');
    const row=document.createElement('div');row.className='msg-row bot';
    const bubble=document.createElement('div');bubble.className='bubble bot';bubble.innerHTML=text;row.appendChild(bubble);body.appendChild(row);
    if(options){
      const optWrap=document.createElement('div');optWrap.className='options';
      options.forEach(opt=>{
        const b=document.createElement('button');
        b.className='opt-btn';
        b.innerText=opt;
        b.onclick=()=>handleOption(opt);
        optWrap.appendChild(b);
      });
      body.appendChild(optWrap);
    }
    body.scrollTop=body.scrollHeight;
  }

  function appendUserMessage(text){
    const body=document.getElementById('chat-body');
    const row=document.createElement('div');row.className='msg-row user';
    const bubble=document.createElement('div');bubble.className='bubble user';
    bubble.innerText=text;row.appendChild(bubble);body.appendChild(row);
    body.scrollTop=body.scrollHeight;
  }

  function resetOptions(){
    appendBotMessage('How can we help you today?', INITIAL_BOT.options);
  }

  async function sendToBackend(message){
    appendUserMessage(message);
    const body=document.getElementById('chat-body');
    const lastOpt=body.querySelector('.options');if(lastOpt) lastOpt.remove();
    appendBotMessage('⏳ Thinking...');
    const resp = await fetch('/chatbot.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message})
    });
    const data = await resp.json();
    const bubbles = body.querySelectorAll('.bubble.bot');
    bubbles[bubbles.length-1].innerHTML = data.reply;
    resetOptions();
  }

  // === New Function for General Enquiry Form ===
  function showEnquiryForm(){
    const body=document.getElementById('chat-body');
    appendBotMessage('Sure! What can I help you with?');
    const wrap=document.createElement('div');
    wrap.className='enquiry-form';
    wrap.innerHTML=`<form id="enq-form">
      <input placeholder='Type your question here...' required>
      <button>Send</button>
    </form>`;
    body.appendChild(wrap);
    body.scrollTop=body.scrollHeight;

    const form = wrap.querySelector('form');
    form.onsubmit = async e => {
      e.preventDefault();
      const question = form.querySelector('input').value.trim();
      if (!question) return;
      appendUserMessage(question);
      wrap.remove();
      appendBotMessage('⏳ Thinking...');
      const resp = await fetch('/chatbot.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: question})
      });
      const data = await resp.json();
      const bubbles = body.querySelectorAll('.bubble.bot');
      bubbles[bubbles.length - 1].innerHTML = data.reply;
      resetOptions();
    };
  }

  // === Handle button options ===
  function handleOption(option){
    const body=document.getElementById('chat-body');
    const lastOpt=body.querySelector('.options');if(lastOpt) lastOpt.remove();
    appendUserMessage(option);

    if(option==='General Enquiry'){
      showEnquiryForm();
    } 
    else if(option==='Doctor & Clinic Info'){
      appendBotMessage('Please type your question about doctors or clinic info:');
      showEnquiryForm();
    }
    else if(option==='Book Appointment'){
      appendBotMessage('Please share your name, phone number, and preferred date below.');
      showAppointmentForm();
    }
  }

  // === Appointment Form ===
  function showAppointmentForm(){
    const body=document.getElementById('chat-body');
    const wrap=document.createElement('div');wrap.className='enquiry-form';
    wrap.innerHTML=`<form id="appt-form">
      <input name="name" placeholder='Full name' required>
      <input name="phone" placeholder='Phone number' required>
      <input name="datetime" placeholder='Preferred date & time' required>
      <button>Book Appointment</button>
    </form>`;
    body.appendChild(wrap);body.scrollTop=body.scrollHeight;

    wrap.querySelector('form').onsubmit=async e=>{
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      appendUserMessage('Booking appointment...');
      wrap.remove();
      const resp = await fetch('/chatbot.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({type: 'booking', ...data})
      });
      const result = await resp.json();
      appendBotMessage(result.reply);
      resetOptions();
    };
  }

  // === Open Chat ===
  document.addEventListener('click', e=>{
    if(e.target.id==='open-chat') createChat();
  });
})();
