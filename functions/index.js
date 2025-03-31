const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp(); //Initializes firebase admin
const db = admin.firestore(); //Instance of friestore


exports.sendReminderNotification = functions
    .region("europe-west1") //Deploys to US by default - need to specify europe
    .pubsub.schedule("every 1 minutes")//schedules . run every minute
    .timeZone("Europe/Dublin")
    .onRun(async (context) =>{
        
        console.log("Checking for Reminders...")
        const timeWindow = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 1000));
        console.log("Current Time is: ",timeWindow);

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
            .where("reminderDateTime", "<=", timeWindow) //Gets due reminders
            .where("notified", "==", false) //Ensures the notification hasnt been sent
            .get();

        if(reminderSnapshot.empty){
            console.log("No Due Reminders")
            return null; //if theres no reminders, safely exits
        }

        console.log(`Found ${reminderSnapshot.size} due reminders.`)

        let notificationsSent = 0;
        for (const doc of reminderSnapshot.docs) { //not using foreach here because it causes issues with await - sequneces dont finish sequentially

            const reminderData = doc.data();
            console.log(`Sending Reminder for ${reminderData.title}`)

            if(reminderData.notified){
                console.log("Notifications for this reminder have already been sent");
                continue;
            }

            const userSnapshot = await db.collection("user")
                .where("fid","==",reminderData.fid)
                .get();
            
            const tokens = [];
            userSnapshot.forEach((userDoc) => {
                const userData = userDoc.data();
                if(userData.pushToken){
                    tokens.push(userData.pushToken);
                }
            });

            if (tokens.length > 0){

                const messages = tokens.map(token => ({
                    to: token,
                    sound: 'default',
                    title: 'Reminder!',
                    body: `${reminderData.title}`,
                    data: {reminderId : doc.id}
                }));

                try {

                    await axios.post("https://exp.host/--/api/v2/push/send", messages);
                    console.log(`Notification Sent Successfully for Reminder: ${reminderData.title}`);
                    notificationsSent++;
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
        const newData = change.after.data();
        const prevData = change.before.data();

        if(!newData.done || prevData.done) {

            console.log(`Reminder ${context.params.reminderId} is already completed or not marked as done.`);
            return null;

        }

        console.log('log1: made it here');

        const userSnapshot = await db.collection("user").doc(newData.completedBy).get();
        if (!userSnapshot.exists) {
            console.error(`User ${newData.completedBy} not found.`);
            return null;
        }

        console.log('Log2: Made it here');

        const userData = userSnapshot.data();
        const userName = userData.firstname;

        console.log('Log3: Made it here');

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

            const messages = tokens.map(token => ({
                to:token,
                sound:'default',
                title:'Reminder Completed!',
                body:`${newData.title} was completed by ${userName}`,
                data: {reminderId : context.params.reminderId}
            }));

            try {
                
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

        if (!newData.recurring) {
            console.log(`Deleting Reminder: ${newData.title}`);
            await db.collection("reminders").doc(context.params.reminderId).delete();
        }
        else {
            console.log(`Updating Reminder: ${newData.title}`);

            let nextReminderDate = new Date(newData.reminderDateTime.toDate());

            if (newData.recurrence === 'Daily') {
                nextReminderDate.setDate(nextReminderDate.getDate() + 1);
            }
            else if (newData.recurrence === 'Weekly') {
                nextReminderDate.setDate(nextReminderDate.getDate() + 7);
            }
            else if (newData.recurrence === 'Monthly') {
                nextReminderDate.setMonth(nextReminderDate.getMonth() + 1);
            }
            else if (newData.recurrence === 'Yearly') {
                nextReminderDate.setFullYear(nextReminderDate.getFullYear() + 1);
            }

            console.log('ReminderId: ', context.params.reminderId)

            
            const displayDate = nextReminderDate.toDateString();

            const displayTime = nextReminderDate.toLocaleTimeString([],{
                hour: '2-digit',
                minute: '2-digit'
            });

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