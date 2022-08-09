document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector('#compose-form').onsubmit = send_email;
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  get_emails(mailbox);
}

function load_mail(email) {

  // Show email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  fetch(`/emails/${email.id}`)
    .then(response => response.json())
    .then(email => {
    
      const emailContainer = document.querySelector('#email-view');
      emailContainer.innerHTML = "";

      element = create_email(email); 
      emailContainer.append(element);

      mark_mail_as_read(email);

  }).catch((error) => {
    console.log(`error: ${error}`);
  });

}


function send_email(e) {
  e.preventDefault();

  const _recipients = document.querySelector('#compose-recipients').value;
  const _subject = document.querySelector('#compose-subject').value;
  const _body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        recipients: _recipients,
        subject: _subject,
        body: _body
    })
  })
  .then(response => response.json())
  .then(result => {
      console.log(result);
      load_mailbox('sent');
  }).catch((error) => {
    console.log(`error: ${error}`);
  });
  
}

function get_emails(mailbox) {

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    
    const emailsContainer = document.querySelector('#emails-view');
    emails.forEach((email) => {

      emailElement = create_email_box(email);
      emailsContainer.appendChild(emailElement);

    });

    
  }).catch((error) => {
    console.log(`error: ${error}`);
  });

}


function create_email(email) {

  const element = document.createElement('div');
  const headerElement = document.createElement('div');
  const replyButtonElement = document.createElement('button');
  const archiveButtonElement = document.createElement('button');
  const bodyElement = document.createElement('div');

  headerElement.innerHTML = `
  
  <b>From:</b> ${email.sender}<br>
  <b>To:</b> ${email.recipients.join(",")}<br>
  <b>Subject:</b> ${email.subject}<br>
  <b>Timestamp:</b> ${email.timestamp}
  
  `;

  replyButtonElement.setAttribute("class", "btn btn-sm btn-outline-primary");
  replyButtonElement.innerHTML = "Reply";
  replyButtonElement.addEventListener('click', () => {
    compose_reply_email(email);
  });

  bodyElement.innerHTML = `<pre>${email.body}</pre>`;

  element.append(headerElement);
  element.append(replyButtonElement);
  element.append(document.createElement('hr'));
  element.append(bodyElement);
  element.append(document.createElement('hr'));

  archiveButtonElement.setAttribute("class", "btn btn-sm btn-outline-primary");
  archiveButtonElement.innerHTML = (email.archived) ? "Unarchive" : "Archive";
  archiveButtonElement.addEventListener('click', () => {
    archive_unarchive(email);
  });

  element.append(archiveButtonElement);

  return element;
}



function create_email_box(email) {

  const emailElement = document.createElement('div');
  emailElement.setAttribute("id", "emailDiv");

  const emailMainDivElement = document.createElement('div');
  emailMainDivElement.setAttribute("class", "emailMain");

  const senderElement = document.createElement('div');
  senderElement.setAttribute("id", "senderDiv");
  senderElement.setAttribute("class", "inline");
  senderElement.innerHTML = email.sender;

  const subjectElement = document.createElement('div');
  subjectElement.setAttribute("id", "subjectDiv");
  subjectElement.setAttribute("class", "inline");
  subjectElement.innerHTML = email.subject;

  emailMainDivElement.appendChild(senderElement);
  emailMainDivElement.appendChild(subjectElement);

  const emailDivElement = document.createElement('div');
  emailDivElement.setAttribute("class", "emailSecondary");  

  const timestampElement = document.createElement('div');
  timestampElement.setAttribute("id", "timestampDiv");
  timestampElement.innerHTML = email.timestamp;

  emailDivElement.appendChild(timestampElement);

  emailElement.appendChild(emailMainDivElement);
  emailElement.appendChild(emailDivElement);
   
  if (email.read) {
    emailElement.style.backgroundColor = 'lightgray';
  }

  emailElement.addEventListener('click', function() {
    load_mail(email);
  });

  return emailElement;
}


function compose_reply_email(email) {

  compose_email();

  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-subject').value = (email.subject.startsWith("Re: ")) ? email.subject : `Re: ${email.subject}`;
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n\n${email.body}`;

}


function mark_mail_as_read(email) {

  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  }); 
}

function archive_unarchive(email) {

  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: !email.archived
    })
  }).then(() => {
    load_mailbox('inbox');
  });

}