import { nanoid } from "nanoid";

export interface VolumeMount {
  name: string;
  path: string;
}

export interface DatabaseTemplate {
  id: string;
  name: string;
  image: string;
  containerPort: number;
  envVars: { key: string; value: string; generated?: boolean }[];
  volumes: VolumeMount[];
  healthCheckTimeout: number;
  supportsSSL: boolean;
}

export const DATABASE_TEMPLATES: DatabaseTemplate[] = [
  {
    id: "postgres-17",
    name: "PostgreSQL 17",
    image: "postgres:17-alpine",
    containerPort: 5432,
    envVars: [
      { key: "POSTGRES_USER", value: "postgres" },
      { key: "POSTGRES_PASSWORD", value: "", generated: true },
      { key: "POSTGRES_DB", value: "postgres" },
    ],
    volumes: [{ name: "data", path: "/var/lib/postgresql/data" }],
    healthCheckTimeout: 60,
    supportsSSL: true,
  },
  {
    id: "postgres-16",
    name: "PostgreSQL 16",
    image: "postgres:16-alpine",
    containerPort: 5432,
    envVars: [
      { key: "POSTGRES_USER", value: "postgres" },
      { key: "POSTGRES_PASSWORD", value: "", generated: true },
      { key: "POSTGRES_DB", value: "postgres" },
    ],
    volumes: [{ name: "data", path: "/var/lib/postgresql/data" }],
    healthCheckTimeout: 60,
    supportsSSL: true,
  },
  {
    id: "mysql-8",
    name: "MySQL 8",
    image: "mysql:8",
    containerPort: 3306,
    envVars: [
      { key: "MYSQL_ROOT_PASSWORD", value: "", generated: true },
      { key: "MYSQL_DATABASE", value: "app" },
    ],
    volumes: [{ name: "data", path: "/var/lib/mysql" }],
    healthCheckTimeout: 90,
    supportsSSL: false,
  },
  {
    id: "redis-7",
    name: "Redis 7",
    image: "redis:7-alpine",
    containerPort: 6379,
    envVars: [],
    volumes: [{ name: "data", path: "/data" }],
    healthCheckTimeout: 30,
    supportsSSL: false,
  },
  {
    id: "mongo-7",
    name: "MongoDB 7",
    image: "mongo:7",
    containerPort: 27017,
    envVars: [
      { key: "MONGO_INITDB_ROOT_USERNAME", value: "root" },
      { key: "MONGO_INITDB_ROOT_PASSWORD", value: "", generated: true },
    ],
    volumes: [{ name: "data", path: "/data/db" }],
    healthCheckTimeout: 60,
    supportsSSL: false,
  },
];

export function getTemplate(id: string): DatabaseTemplate | undefined {
  return DATABASE_TEMPLATES.find((t) => t.id === id);
}

export function generateCredential(): string {
  return nanoid(32);
}

export function buildConnectionString(
  templateId: string,
  host: string,
  port: number,
  envVars: Record<string, string>,
): string {
  const dbType = templateId.split("-")[0];
  switch (dbType) {
    case "postgres":
      return `postgresql://${envVars.POSTGRES_USER}:${envVars.POSTGRES_PASSWORD}@${host}:${port}/${envVars.POSTGRES_DB}?sslmode=require`;
    case "mysql":
      return `mysql://root:${envVars.MYSQL_ROOT_PASSWORD}@${host}:${port}/${envVars.MYSQL_DATABASE}`;
    case "redis":
      return `redis://${host}:${port}`;
    case "mongo":
      return `mongodb://${envVars.MONGO_INITDB_ROOT_USERNAME}:${envVars.MONGO_INITDB_ROOT_PASSWORD}@${host}:${port}`;
    default:
      return "";
  }
}
