const moongoose = require('mongoose');

const validator = require('validator');

const bcrypt = require('bcryptjs');

/**How access and token works only we are perfoming just restructuring****/

var PaintingSchema =  new moongoose.Schema({

   title:{

        type:String
    },
    total_copy:{
        type:String,
        required:true
    },

    copy_for_sale:{
        type:String,
        required:true,
    },
    category:{

        type:String
    },
    for_sale:{

        type:String
    },
    basic_price:{

        type:String,

    },
    plateform_fees:{

        type:String,

    },
    total_taboo:{

        type:String,

    },
    payment_in:{

        type:String
    },

    image:{

        type: String

    },
    available_to:{
        type:String,
        required:true
    },
    contract_type:{
        type:String,
        required:true
    },
    created_at: { 
                    type: String,
                    default: new Date()
                },
    
    created_by: {

            type:String,
            default:null
    },

    updated_at: {

            type: String,
            default: null
    },

    updated_by: {

            type:String,
            default:0
    },

    status:{

        type:String,
        default:'active'

    },

});


var PaintingInfo =  moongoose.model('paintings',PaintingSchema);

module.exports = {PaintingInfo:PaintingInfo};
