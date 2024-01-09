import { Collection, Entity, ManyToOne, MikroORM, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';

import { newDb } from '../../src/db';

@Entity()
export class Book {

    @PrimaryKey({ type: 'text' })
    id!: string;

    @Property({ type: 'text' })
    title!: string;

    @ManyToOne(() => Author)
    author!: Author;

}

@Entity()
export class Author {

    @PrimaryKey({ type: 'text' })
    id!: string;

    @Property({ type: 'text' })
    name!: string;

    @OneToMany(() => Book, book => book.author)
    books = new Collection<Book>(this);

    constructor(name: string) {
        this.name = name;
    }

}

export async function mikroOrmSample() {

    // create an instance of pg-mem
    const db = newDb();

    // bind an instance of mikro-orm to our pg-mem instance
    const orm: MikroORM = await db.adapters.createMikroOrm({
        entities: [Author, Book],
        allowGlobalContext: true,
    });

    // create schema
    await orm.getSchemaGenerator().createSchema();

    // do things
    const books = orm.em.getRepository(Book);
    const authors = orm.em.getRepository(Author);

    const hugo = authors.create({
        id: 'hugo',
        name: 'Victor Hugo',
    });
    const miserables = books.create({
        id: 'miserables',
        author: hugo,
        title: 'Les Misérables',
    });

    await orm.em.persistAndFlush([hugo, miserables]);

    return db;
}
