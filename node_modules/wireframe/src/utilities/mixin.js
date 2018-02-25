function mixin(receiver, supplier) {
    for (var property in supplier) {
        if (supplier.hasOwnProperty(property)) {
            receiver[property] = supplier[property];
        }
    }
    return receiver;
}

module.exports = mixin;