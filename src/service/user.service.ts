import * as http from 'http';
import { UserModel } from "../user.model";
import * as uuid from 'uuid';

const isUUID = (id: string) => {
    const _uuid = id.split('-').slice();
    if (_uuid.length <= 1) return false;
    else if (
        _uuid.length === 5 &&
        _uuid[0].length === 8 &&
        _uuid[1].length === 4 &&
        _uuid[2].length === 4 &&
        _uuid[3].length === 4 &&
        _uuid[4].length === 12
    ) {
        id.split('').forEach(elem => {
            if (
                (elem <= 'a' && elem >= 'z') || (elem <= 'A' && elem >= 'Z') ||
                (elem <= '0' && elem >= '9') || elem !== '-'
            ) return false;
        });
        return true;
    }
    else return false;
}

export const badRequest = (res: http.ServerResponse, statusCode: number, message: string) => {
    res.setHeader('content-type', 'application/json');
    res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
    res.write(JSON.stringify({
        code: statusCode,
        error: {
            message: message
        },
    }, null, 1));
    return res.end();
}

const getRequestBody = async (req: http.IncomingMessage) => {
    let data = '';
    await req.on('data', (chunk: Buffer) => {
        data += chunk;
    });
    return JSON.parse(data);
}

let users: UserModel[] = [];

export const getById = async (res: http.ServerResponse, id: string) => {
    if (!isUUID(id)) return badRequest(res, 400, 'User id is invalid');
    else {
        let userObject = undefined;
        users.forEach(elem => {
            if (elem.id === id ) userObject = elem;
        });
        if (userObject !== undefined) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write(JSON.stringify(userObject, null, 2));
            return res.end();
        }
        else {
            return badRequest(res, 404, 'User not found')
        }
    }
}

export const getAll = async (res: http.ServerResponse) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(JSON.stringify(users, null, 2));
    return res.end();
}

export const create = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    if (req.headers['content-type'] !== 'application/json') {
        return badRequest(res, 400, 'Bad request');
    }

    const jsonData = await getRequestBody(req);
    if ('username' in jsonData && 'age' in jsonData && 'hobbies' in jsonData) {
        const user = new UserModel(uuid.v4(), jsonData.username, jsonData.age, jsonData.hobbies);
        users.push(user);
        req.on('end', () => {
            res.setHeader('content-type', 'application/json');
            res.writeHead(201, { 'Content-Type': 'text/plain' });
            res.write(JSON.stringify(user, null, 2));
            return res.end();
        });
    }
    else return badRequest(res, 400, 'Body does not contain required fields');
}

export const update = async (req: http.IncomingMessage, res: http.ServerResponse, id: string) => {
    if (!isUUID(id)) return badRequest(res, 400, 'User id is invalid');
    if (req.headers['content-type'] !== 'application/json') {
        return badRequest(res, 400, 'Bad request');
    }

    const jsonData = await getRequestBody(req);
    if ('username' in jsonData && 'age' in jsonData && 'hobbies' in jsonData) {
        let userIndex: number = -1;
        users.forEach((elem, index) => {
           if (elem.id === id) userIndex = index;
        });
        if (userIndex === -1) return badRequest(res, 404, 'User doesnt exist');
        users[userIndex].username = jsonData.username;
        users[userIndex].age = jsonData.age;
        users[userIndex].hobbies = jsonData.hobbies.slice();
        req.on('end', () => {
            res.setHeader('content-type', 'application/json');
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write(JSON.stringify(users[userIndex], null, 2));
            return res.end();
        });
    }
    else return badRequest(res, 404, 'Body does not contain required fields');
}

export const remove = async (res: http.ServerResponse, id: string) => {
    if (!isUUID(id)) return badRequest(res, 400, 'User id is invalid');

    let userIndex: number = -1;
    users.forEach((elem, index) => {
       if (elem.id === id) userIndex = index;
    });

    if (userIndex === -1) return badRequest(res, 404, 'User doesnt exist');
    else {
        users.splice(userIndex, 1);
        res.writeHead(204, { 'Content-Type': 'text/plain' });
        return res.end();
    }
}
