import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import './main.html';

const Recipients: any = new Mongo.Collection('recipients');
const reactiveRecipients: any = new ReactiveVar([]);

declare const $;
declare const alertify;

let user = '';

Template['recipientsGrid'].onCreated(() => {
    Template.instance()['authenticated'] = new ReactiveVar(false);
    Meteor.subscribe('recipients');
    Template.instance().autorun(() => {
        reactiveRecipients.set(Recipients.find().fetch());
    })
})

Template['recipientsGrid'].helpers({
    authenticated() { return Template.instance()['authenticated'].get(); },
    getRecipients() { return reactiveRecipients.get().sort((a, b) => { return a.name > b.name; }); },
})

Template['recipientsGrid'].events({
    'click input': (event, instance) => {
        processInputClick(event);
    },
    'click textarea': (event, instance) => {
        processInputClick(event);
    },    
    'keyup input': (event, instance) => {
        updateData(event);
    },
    'keyup textarea': (event, instance) => {
        updateData(event);
    },
    'submit .form-password': (event, instance) => {
        event.preventDefault();
        var enteredPass = event.target[0].value;
        if (enteredPass === "wrightfamily") {
            instance['authenticated'].set(true);
        } else {
            event.target[0].value = '';
        }
    }
})

function processInputClick(event) {
    if (!user) {
        event.preventDefault();
        event.currentTarget.blur();
        attemptLogIn(event);
    } else if (user !== event.currentTarget.parentElement.id) {
        event.preventDefault();
        event.currentTarget.blur();
        alertNotAllowed();
    }
}

function alertNotAllowed() {
    alertify.alert("Not allowed", "Cannot edit this user");
}

function attemptLogIn(event) {
    let name = event.currentTarget.parentElement.id;
    let eventTargetId = event.currentTarget.id;

    alertify.prompt("Enter Password", "Enter password for " + event.currentTarget.parentElement.id, "", (button, val) => { 
      let expectedPass;
      for (let rec of reactiveRecipients.get()) {
          if (rec.name === name) {
              expectedPass = rec.password;
          }
      }
      if (val === expectedPass) {
          user = name;
          console.log(eventTargetId);
          setTimeout(() => { $("#" + eventTargetId).focus(); }, 500);
      }
  }, () => {});
}

function updateData(event) {
    var rec_name = event.currentTarget.parentElement.id;

    if (rec_name === user) {
        let recId;
        for (let rec of reactiveRecipients.get()) {
            if (rec.name === rec_name) {
                recId = rec._id;
                break;
            }
        }
        var recipientDiv = $('#' + rec_name);
        var inputs = recipientDiv.find("input");
        var newQuote = recipientDiv.find("textarea")[0].value;
        Recipients.update(recId, { $set: { gifts: [inputs[0].value, inputs[1].value, inputs[2].value], quote: newQuote }});
    } else {
        event.preventDefault();
    }
}

