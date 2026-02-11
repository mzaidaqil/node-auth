const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : [true, 'Please enter an email'],
        unique : true,
        lowercase : true,
        validate : [isEmail, 'Please enter a valid email']
    },
    password : {
        type : String,
        required : [true, 'Please enter a password'],
        minlength : [6, 'Minimum password length is 6 characters']
    }
});


//fire a function(hook) after a document is saved to the database
userSchema.post('save', function(doc){
    console.log('new user was created & saved', doc);
})

//fire a function(hook) before a document is saved to the database

// Mongoose v9 supports "no next()" middleware: just run synchronously
// (or make this function `async` and `await` work) and it will continue automatically.
userSchema.pre('save', async function(){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    console.log('user about to be created & saved', this);
})

//static methode to login user 

userSchema.statics.login = async function(email, password){
    const user = await this.findOne({email});
    if(user){
        const auth = await bcrypt.compare(password, user.password);
        if(auth){
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
}



//this is to create the model in the database
//'user' is the name of the collection in the database, where plural of the model name is used
//'userSchema' is the schema of the model

const User = mongoose.model('user', userSchema);

module.exports = User;