module.exports.user = class user{
    name;
    password;
    email;
    checks = [];
    constructor(name,password,email){
        this.name =name;
        this.password = password;
        this.email = email;
    }
}