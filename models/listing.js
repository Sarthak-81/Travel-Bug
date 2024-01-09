const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    img: {
        type: String,
        default: "Default Value",
        set: (v) => v==="" ? "default link" : v,
    },
    description: String,
    price: Number, 
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ]
});
// Mongoose Middlware. This function is created as if someone deletes a listing that has some reviews written on it.
// Then if we delete the entire listing, the reviews will not be deleted inside our DB.
listingSchema.post("findOneAndDelete", async(listing) =>{
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;