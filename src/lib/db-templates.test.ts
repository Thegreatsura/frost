import { describe, expect, test } from "bun:test";
import {
  buildConnectionString,
  DATABASE_TEMPLATES,
  generateCredential,
  getTemplate,
} from "./db-templates";

describe("db-templates", () => {
  test("getTemplate returns correct template", () => {
    const postgres17 = getTemplate("postgres-17");
    expect(postgres17).toBeDefined();
    expect(postgres17?.name).toBe("PostgreSQL 17");
    expect(postgres17?.image).toBe("postgres:17-alpine");
    expect(postgres17?.containerPort).toBe(5432);
  });

  test("getTemplate returns undefined for unknown template", () => {
    const unknown = getTemplate("unknown-db");
    expect(unknown).toBeUndefined();
  });

  test("generateCredential returns 32 character string", () => {
    const cred = generateCredential();
    expect(cred).toHaveLength(32);
    expect(typeof cred).toBe("string");
  });

  test("generateCredential returns unique values", () => {
    const cred1 = generateCredential();
    const cred2 = generateCredential();
    expect(cred1).not.toBe(cred2);
  });

  test("buildConnectionString for postgres", () => {
    const connStr = buildConnectionString("postgres", "db-host", 5432, {
      POSTGRES_USER: "testuser",
      POSTGRES_PASSWORD: "testpass",
      POSTGRES_DB: "testdb",
    });
    expect(connStr).toBe("postgresql://testuser:testpass@db-host:5432/testdb");
  });

  test("buildConnectionString for mysql", () => {
    const connStr = buildConnectionString("mysql", "mysql-host", 3306, {
      MYSQL_ROOT_PASSWORD: "rootpass",
      MYSQL_DATABASE: "mydb",
    });
    expect(connStr).toBe("mysql://root:rootpass@mysql-host:3306/mydb");
  });

  test("buildConnectionString for redis", () => {
    const connStr = buildConnectionString("redis", "redis-host", 6379, {});
    expect(connStr).toBe("redis://redis-host:6379");
  });

  test("buildConnectionString for mongo", () => {
    const connStr = buildConnectionString("mongo", "mongo-host", 27017, {
      MONGO_INITDB_ROOT_USERNAME: "admin",
      MONGO_INITDB_ROOT_PASSWORD: "adminpass",
    });
    expect(connStr).toBe("mongodb://admin:adminpass@mongo-host:27017");
  });

  test("all templates have required fields", () => {
    for (const template of DATABASE_TEMPLATES) {
      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.image).toBeDefined();
      expect(template.containerPort).toBeGreaterThan(0);
      expect(template.volumes).toBeDefined();
      expect(template.volumes.length).toBeGreaterThan(0);
      expect(template.healthCheckTimeout).toBeGreaterThan(0);
    }
  });

  test("templates have expected database types", () => {
    const templateIds = DATABASE_TEMPLATES.map((t) => t.id);
    expect(templateIds).toContain("postgres-17");
    expect(templateIds).toContain("postgres-16");
    expect(templateIds).toContain("mysql-8");
    expect(templateIds).toContain("redis-7");
    expect(templateIds).toContain("mongo-7");
  });

  test("templates have correct volume paths", () => {
    const postgres = getTemplate("postgres-17");
    expect(postgres?.volumes[0].path).toBe("/var/lib/postgresql/data");

    const mysql = getTemplate("mysql-8");
    expect(mysql?.volumes[0].path).toBe("/var/lib/mysql");

    const redis = getTemplate("redis-7");
    expect(redis?.volumes[0].path).toBe("/data");

    const mongo = getTemplate("mongo-7");
    expect(mongo?.volumes[0].path).toBe("/data/db");
  });

  test("templates with credentials have generated flag", () => {
    const postgres = getTemplate("postgres-17");
    const passEnv = postgres?.envVars.find(
      (e) => e.key === "POSTGRES_PASSWORD",
    );
    expect(passEnv?.generated).toBe(true);

    const mysql = getTemplate("mysql-8");
    const mysqlPassEnv = mysql?.envVars.find(
      (e) => e.key === "MYSQL_ROOT_PASSWORD",
    );
    expect(mysqlPassEnv?.generated).toBe(true);
  });
});
