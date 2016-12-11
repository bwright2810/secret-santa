import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

const Recipients: any = new Mongo.Collection('recipients');

Meteor.startup(() => {
  // code to run on server at startup
  Meteor.publish('recipients', function tasksPublication() {
    return Recipients.find();
  });
});
