
const fs = require("fs");

const contactsPath = "./data/contacts.json";
const meetingsPath = "./data/meetings.json";
const contacts = require(contactsPath);
const meetings = require(meetingsPath);
//set up api express
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

//contacts api
const port = 3030;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/`);
})
app.get("/", (request, respond) => {
    console.log("got request!")
    respond.send("Hello!")
})

app.get("/contacts", (request, respond) => {
    respond.json(contacts);
})
app.get("/contacts/:id", (request, respond) => {
    const { id } = request.params;
    const contact = contacts.contacts.find(contact => Number(contact.id) === Number(id))
    respond.json(contact);
})
app.put("/contacts/:id", (request, respond) => {
    const { id } = request.params;
    const updateContact = request.body;
  
    const updateContacts = contacts.contacts.map(contact => Number(contact.id) === Number(id) ? updateContact:contact)
    contacts.contacts = [...updateContacts];
    writeJsonFile({contacts: updateContacts});
    respond.json(updateContacts);
})
app.delete("/contacts/:id", (request, respond) => {
    const { id } = request.params;
    const updateContacts = contacts.contacts.filter(contact => Number(contact.id) !== Number(id))
    writeJsonFile({contacts: updateContacts});
    respond.json(updateContacts);
})
app.post("/contacts", (request, respond) => {
    const id = contacts.contacts.length + 1;
    const newContact = request.body;
    contacts.contacts.push({id : id , ...newContact});
    
    writeJsonFile(contacts);
    //console.log('contacts', contacts.contacts);
    respond.json(contacts.contacts);
})
//meetings api
app.get("/contacts/:id/meetings", (request, respond) => {
    const { id } = request.params;
    const listOfMeetings =  meetings.meetings.filter(meeting => Number(meeting.contactId) === Number(id))
    console.log('listOfMeetings', listOfMeetings);
    respond.json(listOfMeetings);
})
app.post("/contacts/:id/meetings", (request, respond) => {
    const { id } = request.params;
    const meetingId = meetings.meetings.length + 1;
    const {name} = request.body;
    console.log('meetings',meetingId,name,id);
    meetings.meetings.push({id : meetingId ,name,contactId:id });
    const listOfMeetings =  meetings.meetings.filter(meeting => Number(meeting.contactId) === Number(id))
    writeJsonFile(meetingsPath,meetings);
    respond.json(listOfMeetings);
})

const writeJsonFile = (path=contactsPath,updateData) => {
    fs.writeFile(`src/${path}`, JSON.stringify(updateData), 'utf8', (err) => {
  
        if (err) {
            console.log(err);
        } else {
            console.log('successfully created json');
        }

    })
}
