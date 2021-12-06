import moment from 'moment';
function formatmessage(userid,text){
    return{
        userid,
        text,
        time:moment().format('hh:mm a')
    }
}

// module.exports = {
//     formatMessage:formatMessage
// };
// export const profileDetails = mongoose.model('userDetail' , userDetails);
export const formatMessage= formatmessage;