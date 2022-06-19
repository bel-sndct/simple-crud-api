export class UserModel {
    constructor(id: string, username: string, age: number, hobbies: string[]) {
        this.id = id;
        this.username = username;
        this.age = age;
        this.hobbies = hobbies.slice();
    }

    id: string;
    username: string;
    age: number;
    hobbies: string[];
}