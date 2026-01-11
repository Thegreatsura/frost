export type ServiceTemplate = {
  id: string;
  name: string;
  image: string;
  description: string;
  containerPort?: number;
};

export const SERVICE_TEMPLATES: ServiceTemplate[] = [
  {
    id: "httpbin",
    name: "HTTPBin",
    image: "kennethreitz/httpbin",
    description: "HTTP request/response testing",
    containerPort: 80,
  },
  {
    id: "nginx",
    name: "Nginx",
    image: "nginx:alpine",
    description: "Static file server",
    containerPort: 80,
  },
  {
    id: "whoami",
    name: "Whoami",
    image: "traefik/whoami",
    description: "Shows request headers/info",
    containerPort: 80,
  },
  {
    id: "hello",
    name: "Hello World",
    image: "crccheck/hello-world",
    description: "Simple hello world",
    containerPort: 8000,
  },
  {
    id: "echo-server",
    name: "Echo Server",
    image: "ealen/echo-server",
    description: "Logs all requests to stdout (JSON)",
    containerPort: 80,
  },
];
