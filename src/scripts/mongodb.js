docker ps

docker exec -it b8f1b839c92e `
  mongo -u Imwalkingnow -p minhasenhasecreta --authenticationDatabase herois

// databases
show dbs

// mudando o contexto para uma database
use heroi

// mostrar tabelas
show collections

db.herois.insert({
  nome: `Flash`,
  poder: `Velocidade`,
  dataNascimento: `1998-01-01`
})

db.herois.find();
db.herois.find().pretty();

for (let i=0; i<= 1000; i++) {
  db.herois.insert({
    nome: `Clone-${i}`,
    poder: `Velocidade`,
    dataNascimento: `1998-01-01`
  })
}

db.herois.count();

db.herois.findOne();

db.herois.find().limit(1000).sort({nome: -1});
db.herois.find({}, {poder: 1, _id: 0});
db.herois.findOne({_id: ObjectId("66458cc5449c180dffd9a05b")})

// create

db.herois.insert({
  nome: `Flash`,
  poder: `Velocidade`,
  dataNascimento: `1998-01-01`
})

// read
db.herois.find();

// update

db.herois.update({ _id: ObjectId("664586ed449c180dffd9a04b") },
  { nome: `Mulher Maravilha` });

db.herois.update({ _id: ObjectId("66458cc5449c180dffd9a05b") }, { $set { nome: `Lanterna Verde` } });

db.herois.update(
  { poder: `Velocidade` },
  { $set: { poder: "Super Força" } }
);

// delete
db.herois.remove({});

db.herois.remove({nome: `Mulher Maravilha`});
