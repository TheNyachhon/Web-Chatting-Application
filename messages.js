import moment from 'moment';
function formatmessage(username,text){
    return{
        username,
        text,
        time:moment().format('h:mm a')
    }
}

// module.exports = {
//     formatMessage:formatMessage
// };
// export const profileDetails = mongoose.model('userDetail' , userDetails);
export const formatMessage= formatmessage;