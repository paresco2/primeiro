const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const flash = require("express-flash");

const app = express();

const conn = require("./db/conn");

//models
const Tought = require("./models/Tought");
const User = require("./models/User");

//import routes - alem de importar as rotas, preciso dizer que irei usa-las, se nao nao funciona. estoufazendo isso la embaixo, na parte de app.use('/', authRoutes)
const ToughtsController = require("./controller/ToughtController");
const toughtsRoutes = require("./routes/toughtsRoutes");
const authRoutes = require("./routes/authRoutes");

//tamplates engine
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

//receber resposta do body
app.use(
	express.urlencoded({
		extended: true,
	})
);
app.use(express.json());

//session middleware - este comando cria uma sessao
app.use(
	session({
		name: "session",
		secret: "nosso-secret",
		resave: false,
		saveUninitialized: false,
		store: new FileStore({
			logFn: function () {},
			path: require("path").join(require("os").tmpdir(), "sessions"), // aqui esta configurando o caminho onde as sessoes serao salvas usando o aminha para colocar na pasta sessions, esse é o comando o 'path' e o 'os' sao cor-module internos do nodejs
		}),
		cookie: {
			secure: false,
			maxAge: 360000, // tem o tempo maximo de 1 dia
			expires: new Date(Date.now() + 360000), // aqui ele vai expirar em 1 dia, garantindo a maxAge acima
			//httpOnly: true, // temos que usar essa flag para poder usar na nossa maquina que nao tem https, caso contrario, para usar em servidores com https nao precisaria, pois se colocar, nao iria funcionar
		},
	})
);

// flash message
app.use(flash());

//public path
app.use(express.static("public"));

//enviar as sessoes para a resposta

app.use((req, res, next) => {
	if (req.session.userid) {
		//verifica se o usuario tem a sessao(session), se tiver, eu pego da requisicao(req) e envio para a resposta(res), se o usuario estiver logado, eu envio sua seesion para ir acompanhando ele durante a navegacao no site
		res.locals.session = req.session;
	}
	next();
});

// routes

app.use("/toughts", toughtsRoutes);
app.use("/", authRoutes); // alem de importar as rotas acima, na parte de cima do codigo, tambem preciso dizer que irei usa-las, colocando uma '/' digo que a rota sera /login e /register, ja que nas rotas eu defini como /login e /register
app.get("/", ToughtsController.showToughts); //aqui eu crio uma rota / para ser a homne do meu sistema, entao alem do / tambem tenho o /toughts, usado logo aqui em cima

conn
	//.sync({ force: true })
	.sync()
	.then(() => {
		app.listen(3000);
	})
	.catch((error) => console.log("houove um erro: ", error));
