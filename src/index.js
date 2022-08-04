
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
    let mappedContacts = contacts.contacts.map(contact => {
        return {
            ...contact,
            meetings: meetings.meetings.filter(m => m.contactId === contact.id)
        }
    })
    respond.json({ contacts: mappedContacts });
})
app.get("/contacts/:id", (request, respond) => {
    const { id } = request.params;
    const contact = contacts.contacts.find(contact => Number(contact.id) === Number(id))
    respond.json({ contact: contact });
})
app.put("/contacts/:id", (request, respond) => {
    const { id } = request.params;
    const updateContact = request.body;

    const updateContacts = contacts.contacts.map(contact => Number(contact.id) === Number(id) ? { id: id, ...updateContact } : contact)
   
    contacts.contacts = [...updateContacts];
    console.log('contacts',contacts);
    writeJsonFile(contactsPath,contacts);
    respond.status(201).json({
        contact:{id:id,...updateContact},
        meetings: meetings.meetings.filter(meeting => Number(meeting.contactId) === id)
    });
})
app.delete("/contacts/:id", (request, respond) => {
    const { id } = request.params;
    const updateMeetings = meetings.meetings.filter(meeting => Number(meeting.contactId) !== Number(id))
    const updateContacts = contacts.contacts.filter(contact => Number(contact.id) !== Number(id))
    writeJsonFile(meetingsPath,{meetings:updateMeetings})
    writeJsonFile({ contacts: updateContacts });
    respond.status(201).json(updateContacts);
})
app.post("/contacts", (request, respond) => {
    const id = contacts.contacts.length + 1;
    const newContact = request.body;
    contacts.contacts.push({ id: id, ...newContact });
    console.log('contacts',contacts);
   
    writeJsonFile(contactsPath,contacts);
    //console.log('contacts', contacts.contacts);
    respond.status(201).json({contact:{id:id, ...newContact}});
})
//meetings api
app.get("/contacts/:id/meetings", (request, respond) => {
    const { id } = request.params;
    const listOfMeetings = meetings.meetings.filter(meeting => Number(meeting.contactId) === Number(id))
    console.log('listOfMeetings', listOfMeetings);
    respond.json(listOfMeetings);
})
app.post("/contacts/:id/meetings", (request, respond) => {
    const { id } = request.params;
    const meetingId = meetings.meetings.length + 1;
    const { name } = request.body;
    console.log('meetings', meetingId, name, id);
    meetings.meetings.push({ id: meetingId, name, contactId: id });
    const listOfMeetings = meetings.meetings.filter(meeting => Number(meeting.contactId) === Number(id))
    writeJsonFile(meetingsPath, meetings);
    respond.status(201).json(listOfMeetings);
})
app.put("/contacts/:id/meetings/:meetingId", (request, respond) => {
    const { id,meetingId } = request.params;
    const {name}= request.body;
    const updateMeeting = {
        id:meetingId,
        name:name,
        contactId:id
    }
   
    const updateMeetings = meetings.meetings.map(meeting=> Number(meeting.id) ===  Number(meetingId)?updateMeeting:meeting)
    const listOfMeetings = updateMeetings.filter(meeting => Number(meeting.contactId) === Number(id))
    console.log('updateMeetings',updateMeetings);
    console.log('listOfMeetings',listOfMeetings);
    writeJsonFile(meetingsPath, {meetings:updateMeetings});
    respond.status(201).json(listOfMeetings);
})
app.delete("/contacts/:id/meetings/:meetingId", (request, respond) => {
    const { id,meetingId } = request.params;
    const updateMeetings = meetings.meetings.filter(meeting => Number(meeting.id) !== Number(meetingId))
    const meetingsByContact = updateMeetings.filter(meeting=>Number(meeting.contactId) === Number(id))
    console.log('updateMeetings',updateMeetings);
    console.log('meetingsByContact',meetingsByContact);
    writeJsonFile(meetingsPath,{meetings:updateMeetings})
    respond.status(201).json(meetingsByContact);
})
const writeJsonFile = (path = contactsPath, updateData) => {
    console.log(updateData);
    fs.writeFile(`src/${path}`,JSON.stringify(updateData), 'utf8', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('successfully created json');
        }

    })
}
