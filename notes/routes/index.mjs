import { default as express } from 'express';
export const router = express.Router();

router.get('/', async (request, response, next) => {
  // ... placeholder for Notes home page code
  response.render('index', { title: 'Notes' });
})
