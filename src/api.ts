import express from 'express';
import cors from 'cors';
import Docker from 'dockerode';

export const app = express();

const docker = new Docker();
const containerName = 'sveltekit-app-container';

app.use(cors({ origin: true }));

app.use(express.json());
app.use(express.raw({ type: 'application/vnd.custom-type' }));
app.use(express.text({ type: 'text/html' }));

// Healthcheck endpoint
app.get('/', (req, res) => {
  res.status(200).send({ status: 'ok' });
});

const api = express.Router();

api.get('/hello', (req, res) => {
  res.status(200).send({ message: 'hello world' });
});

api.post('/start-container', async (req, res) => {
  try {
    console.log('incoming request!');
    // check if the container already exists
    let container = await docker.listContainers({
      all: true,
      filters: { name: [containerName] }
    });

    console.log('Container: ', container);

    if (!container.length) {
      container = await docker.createContainer({
        Image: 'coder-3d2cd7db-d4e2-4a7d-b0b2-b4e6182c1472:latest',
        name: containerName,
        ExposedPorts: { '3000/tcp': {} },
        HostConfig: {
          PortBindings: { '3000/tcp': [{ HostPort: '3000' }] }
        }
      });

      // If the container exists but is stopped, get its instance
      // container = docker.getContainer(container[0].id);

      await container.start();
      res.status(200).send('Container started succesfully');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to start container');
  }
});

// Version the api
app.use('/api/v1', api);
