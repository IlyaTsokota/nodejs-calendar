const { Schema, model } = require('mongoose');

const userSchema = Schema({
    email: {
        type: String,
        require: true,
        unique: true,
    },
    login: {
        type: String,
        require: true,
        unique: true,
    },
    firstName: {
        type: String,
        require: true,
    },
    lastName: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    avatarUrl: String,
    resetToken: String,
    resetTokenExp: Date,
});

// userSchema.methods.addToCart = function(course) {
//     const items = [...this.cart.items];
//     const idx = items.findIndex(({ courseId }) => courseId.toString() === course._id.toString());

//     if (idx === -1) {
//         items.push({
//             courseId: course._id,
//             count: 1,
//         });
//     } else {
//         items[idx].count += 1;
//     }

//     this.cart = { items };

//     return this.save();
// };

// userSchema.methods.removeFromCart = function(id) {
//     const items = [...this.cart.items];
//     const idx = items.findIndex(({ courseId }) => courseId.toString() === id.toString());

//     if (items[idx].count === 1) {
//         items.splice(idx, 1);
//     } else {
//         items[idx].count -= 1;
//     }

//     this.cart = { items };

//     return this.save();
// };

// userSchema.methods.clearCart = function(id) {
//     this.cart = { items: [] };
//     return this.save();
// };

module.exports = model('User', userSchema);