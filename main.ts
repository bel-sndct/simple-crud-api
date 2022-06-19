import * as http from 'http';
import * as dotenv from 'dotenv';
import {getById, getAll, create, update, remove, badRequest} from "./src/service/user.service";

dotenv.config();
const serverPort = process.env.PORT || 6000;

const routes: string[] = ['/', '/api/users'];

http.createServer((req, res) => {
    if (routes.find(path => path === req.url) || req.url?.includes('/api/users/')) {
        if (req.url === '/') {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write('Hello');
            return res.end();
        }

        if (req.url?.includes('/api/users/') && req.url?.split('/').length === 4 && req.method === 'GET') {
            return getById(res, req.url?.split('/')[req.url?.split('/').length - 1]);
        }
        else if (req.url === '/api/users' && req.method === 'GET') {
            return getAll(res);
        }
        else if (req.url === '/api/users' && req.method === 'POST') {
            return create(req, res);
        }
        else if (req.url?.includes('/api/users/') && req.url?.split('/').length === 4 && req.method === 'PUT') {
            return update(req, res, req.url?.split('/')[req.url?.split('/').length - 1])
        }
        else if (req.url?.includes('/api/users/') && req.url?.split('/').length === 4 && req.method === 'DELETE') {
            return remove(res, req.url?.split('/')[req.url?.split('/').length - 1]);
        }
        else return badRequest(res, 404, 'Bad request');
    }
    else {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write('Wrong path');
        return res.end();
    }
}).listen(serverPort, () => {
    console.log(`Server started on port ${serverPort}`);
});