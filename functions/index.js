const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();


exports.sendReminderNotification = functions
    .region("europe-west1") //Deploys to US by default - need to specify europe
    .pubsub.schedule("every 1 minutes")//Schedules . run every minute
    .timeZone("Europe/Dublin")
    .onRun(async (context) =>{
        
        console.log("Checking for Reminders...")
        //const timeWindow = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 1000));
        //console.log("Current Time is: ",timeWindow);

        //Creating a time window
        const now = new Date();
        const startOfMinute = new Date(now)
        startOfMinute.setSeconds(0, 0); //Setting the start of the window to currenthour:currentminute:00.00

        const endOfMinute = new Date(now);
        endOfMinute.setSeconds(59,999); //Setting the end of the window to currenthour:currentminute:59.999

        //Creating firebase timestamps of the above - ensures its in proper UTC format
        const startTimestamp = admin.firestore.Timestamp.fromDate(startOfMinute);
        const endTimestamp = admin.firestore.Timestamp.fromDate(endOfMinute);

        //Getting all reminders - used for deugging to see if there were any missed reminders
        const allRemindersSnapshot = await db.collection("reminders").get();

        console.log(`Total Reminders in Firestore: ${allRemindersSnapshot.size}`);
        
        allRemindersSnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`Reminder: ${data.title}`);
            console.log("reminderDateTime:", data.reminderDateTime);
            console.log("reminderDateTime (as Date):", data.reminderDateTime?.toDate());
            console.log("notified:", data.notified);
        });

        const reminderSnapshot = await db.collection("reminders")
            .where("reminderDateTime", ">=", startTimestamp) //Gets reminder that are due within this minute
            .where("reminderDateTime", "<=", endTimestamp)
            .where("notified", "==", false) //Ensures the notification hasnt already been sent
            .get();

        if(reminderSnapshot.empty){
            console.log("No Due Reminders")
            return null; //if theres no reminders, safely exits
        }

        console.log(`Found ${reminderSnapshot.size} due reminders.`)

        //Looping through all found reminders
        for (const doc of reminderSnapshot.docs) { //not using foreach here because it causes issues with await - sequneces dont finish sequentially

            const reminderData = doc.data();
            console.log(`Sending Reminder for ${reminderData.title}`)

            if(reminderData.notified){
                console.log("Notifications for this reminder have already been sent");
                continue;
            }

            //Getting all users in the family this reminder belongs to
            const userSnapshot = await db.collection("user")
                .where("fid","==",reminderData.fid)
                .get();
            
            //Getting all pushtokens
            const tokens = [];
            userSnapshot.forEach((userDoc) => {
                const userData = userDoc.data();
                if(userData.pushToken){
                    tokens.push(userData.pushToken);
                }
            });

            if (tokens.length > 0){
                //Making the notifications structure
                const messages = tokens.map(token => ({
                    to: token,
                    sound: 'default',
                    title: 'Reminder!',
                    body: `${reminderData.title}`,
                    data: {reminderId : doc.id}
                }));

                try {
                    //Sending the reminder and updating firebase to say the reminder has been sent
                    await axios.post("https://exp.host/--/api/v2/push/send", messages);
                    console.log(`Notification Sent Successfully for Reminder: ${reminderData.title}`);
                    await db.collection("reminders").doc(doc.id).update({
                        notified: true
                    });

                } 
                catch (error) {
                    console.error("Error Sending Push Notification", error);
                }

            }
            else {
                console.log("No push tokens found");
            }

        }

    });
    
exports.sendReminderCompleted = functions
    .region("europe-west1")
    .firestore.document("reminders/{reminderId}")
    .onUpdate(async (change, context) => {

        console.log(context.params.reminderId);
        const newData = change.after.data(); //Reminder after the update
        const prevData = change.before.data(); //Reminder before the update
        
        //Skips reminders that have previsouly been marked as done or havent been marked as done
        //Needed as function monitors for any update to the reminder - not necessarily just being marked as done
        //Also prevents multiple noti from being sent if a user spams the mark done button
        if(!newData.done || prevData.done) {

            console.log(`Reminder ${context.params.reminderId} is already completed or not marked as done.`);
            return null;

        }

        console.log('log1: made it here');

        //Getting the user that completed the reminder
        const userSnapshot = await db.collection("user").doc(newData.completedBy).get();
        if (!userSnapshot.exists) {
            console.error(`User ${newData.completedBy} not found.`);
            return null;
        }

        console.log('Log2: Made it here');

        //Getting that users name
        const userData = userSnapshot.data();
        const userName = userData.firstname;

        console.log('Log3: Made it here');

        //Get all family members
        const familySnapshot = await db.collection("user")
            .where("fid","==",newData.fid)
            .get();

        console.log('Log4: made it here');
        const tokens = [];
        familySnapshot.forEach((doc) => {
            const familyMember = doc.data();
            if (familyMember.pushToken && familyMember.uid !== newData.completedBy){
                tokens.push(familyMember.pushToken);
            }
        });

        console.log('Log5: made it here');

        if (tokens.length > 0){
            //Making the notification structure
            const messages = tokens.map(token => ({
                to:token,
                sound:'default',
                title:'Reminder Completed!',
                body:`${newData.title} was completed by ${userName}`,
                data: {reminderId : context.params.reminderId}
            }));

            try {
                //Sending the notification
                await axios.post("https://exp.host/--/api/v2/push/send", messages);
                console.log(`Notification sent`);

            } 
            catch (error) {
                console.error("Error sending push: ",error);
            }

        }
        else {
            console.log("No push found for family members");
        }
        //Check if reucrring, deleting if not
        if (!newData.recurring) {
            console.log(`Deleting Reminder: ${newData.title}`);
            await db.collection("reminders").doc(context.params.reminderId).delete();
        }
        else {
            console.log(`Updating Reminder: ${newData.title}`);
            //If it is recurring, get current reminderDateTime and
            let nextReminderDate = new Date(newData.reminderDateTime.toDate());

            //If daily, add 1 to move it up a day
            if (newData.recurrence === 'Daily') {
                nextReminderDate.setDate(nextReminderDate.getDate() + 1);
            }
            //If weekly, add 7 to move it 7 days
            else if (newData.recurrence === 'Weekly') {
                nextReminderDate.setDate(nextReminderDate.getDate() + 7);
            }
            //If monthly, get the month and add 1 to it
            else if (newData.recurrence === 'Monthly') {
                nextReminderDate.setMonth(nextReminderDate.getMonth() + 1);
            }
            //If yearly, get the year and add 1 to it
            else if (newData.recurrence === 'Yearly') {
                nextReminderDate.setFullYear(nextReminderDate.getFullYear() + 1);
            }

            console.log('ReminderId: ', context.params.reminderId)

            //Take the updated date and convert it for displaying
            const displayDate = nextReminderDate.toDateString();
            //Do Same for Time
            const displayTime = nextReminderDate.toLocaleTimeString([],{
                hour: '2-digit',
                minute: '2-digit'
            });
            //Update reminder, setting notified and done to false, updating the timestamp and the display date and time
            await db.collection("reminders").doc(context.params.reminderId).update({
                notified: false,
                done: false,
                reminderDateTime: admin.firestore.Timestamp.fromDate(nextReminderDate),
                date: displayDate,
                time: displayTime
            });

        }

        return null;

    });