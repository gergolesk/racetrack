// accessing security keys
const {RECEPTIONIST_KEY, OBSERVER_KEY, SAFETY_KEY} = process.env;

const validateAccessKey = (socket) => {
    socket.on("validate_access_key", (key, callback) => {
        if (key.user === 'RECEPTIONIST_KEY' && key.password === RECEPTIONIST_KEY) {
            callback({success: true, message: 'receptionist'})
        } else if (key.user === 'OBSERVER_KEY' && key.password === OBSERVER_KEY) {
            callback({success: true, message: 'observer'})
        } else if (key.user === 'SAFETY_KEY' && key.password === SAFETY_KEY) {
            callback({success: true, message: 'safety'})
        } else {
            setTimeout(() => {
                callback({success: false, message: 'Invalid access key.'})
            }, 500)
        }
    })
}
module.exports = validateAccessKey;