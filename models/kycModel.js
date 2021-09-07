const moongoose = require('mongoose');

const validator = require('validator');

const bcrypt = require('bcryptjs');

/**How access and token works only we are perfoming just restructuring****/

var KycSchema =  new moongoose.Schema({

    user_id:[{ type: moongoose.Schema.Types.ObjectId, ref: 'users' }],

    image:{
        type:String,
        required:true
    },
   
    created_at: { 
                    type: String,
                    default: new Date()
                },
    updated_at: {

            type: String,
            default: null
    },
    status:{

        type:String,
        default:'pending'

    },
   
   
});


var KycInfo =  moongoose.model('kycs',KycSchema);

module.exports = {KycInfo:KycInfo};
