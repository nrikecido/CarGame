//Coche, movimiento, efecto, posición específica, posición general respecto a demás coches
class CarGame {
    constructor(canvasWidth, canvasHeight) {

        //Primer canvas
        this.canvas = document.getElementById('juego');
        this.context = this.canvas.getContext("2d");
        
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        
        this.image_track = new Image();
        this.image_track.src = "src/circuitotornillos.png";

		// Segundo canvas
        this.canvas2 = document.getElementById('juegoOculto');
        this.context2 = this.canvas2.getContext("2d");
        
        this.canvas2.width = canvasWidth;
        this.canvas2.height = canvasHeight;

        this.image_track2 = new Image();
        this.image_track2.src = "src/map_circuitotornillos.png";

        //Coche
        this.image_car = new Image();
        this.image_car.src = "src/cocheverde.png";
        this.image_car.width = 80;
        this.image_car.height = 80;

        // Movimiento y posición
        this.config = {
            car: {
                x: 1320, // xxx calcular la salida de meta
                y: 1590,
                position: "top"
            },
            speed: 15,
            find_obstacle: false
        };

		this.spriteCar = {
			top: { x: 0, y: 0, width: 300, height: 300 },
			top_right: { x: 300, y: 0, width: 310, height: 295 },
			right: { x: 595, y: 0, width: 300, height: 300 },
			down_right: { x: 900, y: 0, width: 300, height: 330 },
			down: { x: 1200, y: 0, width: 292, height: 300 },
			down_left: { x: 1500, y: 0, width: 300, height: 300 },
			left: { x: 1900, y: 0, width: 300, height: 300 },
			top_left: { x: 2210, y: 0, width: 300, height: 300 },
		}
        
		this.colors = {
			background: { r: 237, g: 28, b: 36 }, // rojo
			oil: { r: 0, g: 0, b: 0 }, // negro
			glue: { r: 255, g: 255, b: 255 }, // blanco
			crash: { r: 63, g: 72, b: 204 }, // azul
			lap: { r: 88, g: 210, b: 0 }, // verde
		};
        this.lapCounter = 0;
		this.loader([this.image_track, this.image_track2, this.image_car]);
    }
    
	loader(images){

		const promesas = images.map( (img) => {
			return new Promise((resolve, reject) => {
				img.onload = () => { resolve(); }
		  	})
		});

		Promise.all(promesas).then( () => {
			this.config.interval = setInterval(()=>{
				this.load_track_car();
			}, 100);
		} )
	}
   
    load_track_car() {

		this.context.drawImage(this.image_track, this.config.car.x, this.config.car.y, 3000, 3000, 0, 0, 3000, 3000);
        this.context2.drawImage(this.image_track2, this.config.car.x, this.config.car.y, 3000, 3000, 0, 0, 3000, 3000);

        const position = this.config.car.position;
		this.context.drawImage(
			this.image_car, 
			this.spriteCar[position].x, 
			this.spriteCar[position].y, 
			this.spriteCar[position].width,
			this.spriteCar[position].height,
			(this.canvas.width / 2) - 40,
			(this.canvas.height / 2) - 40,
			this.image_car.width,
			this.image_car.height);
		this.move_car();
        this.detectCollision();
    }

    move_car() {
        const position = this.config.car.position;

		if (position === "top") {
            this.config.car.y -= this.config.speed;
        } else if (position === "down") {
            this.config.car.y += this.config.speed;
        } else if (position === "left") {
            this.config.car.x -= this.config.speed;
        } else if (position === "right") {
            this.config.car.x += this.config.speed;
        } else if (position === "top_right") {
            this.config.car.x += this.config.speed;
            this.config.car.y -= this.config.speed;
        } else if (position === "down_right") {
            this.config.car.x += this.config.speed;
            this.config.car.y += this.config.speed;
        } else if (position === "top_left") {
            this.config.car.x -= this.config.speed;
            this.config.car.y -= this.config.speed;
        } else if (position === "down_left") {
            this.config.car.x -= this.config.speed;
            this.config.car.y += this.config.speed;
        }
    }
    
    detectCollision() {

        let carX = this.canvas.width / 2;
        let carY = this.canvas.height / 2;
        const position = this.config.car.position;

		if(position === "top"){
			carY -=40;
		}else if(position === "down"){
			carY +=40;
		} else if(position === "left"){
            carX -= 40;
        } else if(position === "right"){
            carX += 40;
        }else if(position === "top_right"){
            carX += 40;
            carY -= 40;
        }else if(position === "top_left"){
            carX += 40;
            carY += 40;
        }else if(position === "down_right"){
            carX -= 40;
            carY -= 40;
        }else if(position === "down_left"){
            carX -= 40;
            carY += 40;
        }

        const imageData = this.context2.getImageData(carX, carY, 1, 1);

        const pixel = {
            r: imageData.data[0],
            g: imageData.data[1],
            b: imageData.data[2]
        };
        console.log(this.config.speed);
        this.config.car.find_obstacle = true;
        // Comprobar si el color del pixel coincide con los colores de colisión

		const test = this.colorMatch(pixel, this.colors.oil);

        if (this.colorMatch(pixel, this.colors.oil)) {
            this.applyOilEffect();
        } else if (this.colorMatch(pixel, this.colors.crash)) {
            this.applyCrashEffect();
        } else if (this.colorMatch(pixel, this.colors.lap)) {
            this.applyLapEffect();
        } else if (this.colorMatch(pixel, this.colors.glue)) {
            this.applyGlueEffect();
        } else {
            // Desactivar los efectos
            this.deactivateAllEffects();
        }
	}

    //Necesitamos pasar de nuevo los efectos a false
    deactivateAllEffects(){
        this.config.car.find_obstacle = false;
		this.config.speed = 15;
    }

    colorMatch(pixel, targetColor) {
        // Comprobar si el color del pixel coincide con el color objetivo
        return (
            ( pixel.r >= (targetColor.r - 5) && pixel.r <= (targetColor.r + 5) ) &&
            ( pixel.g >= (targetColor.g - 5) && pixel.g <= (targetColor.g + 5) ) &&
            ( pixel.b >= (targetColor.b - 5) && pixel.b <= (targetColor.b + 5) ) 
        );
    }

    applyOilEffect() {
        const position = this.config.car.position;
        if (position === "top") {
            this.config.car.x += 5;
        } else if (position === "down") {
            this.config.car.x -= 5;
        } else if (position === "left") {
            this.config.car.y += 5;
        } else if (position === "right") {
            this.config.car.y -= 5;
        }
    
        console.log('HAS PISADO ACEITE');
    }

    applyCrashEffect() {
        this.config.speed = 0;
    }

    applyLapEffect(){
        console.log("Vuelta completada. Vueltas totales: " + this.lapCounter);
    }

    applyGlueEffect(){
        this.config.speed = 2;
        console.log('HAS PASADO POR PEGAMENTO');
    }
} 



class Teclado {
    constructor(game) {
        //Aquí asignamos nuestro juego al teclado
        this.game = game;
        //Aquí, declaramos un objeto, pasando las teclas a false, para luego detectarlas
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ArrowDown: false,
            Space: false,
        };
        //Estos son los "escuchadores" eventos. Cuando se 'escucha' el evento(event), en este caso pulsar o soltar tecla, se ejecuta el método/función corresp.
        window.addEventListener('keydown', event => this.handleKey(event));
        window.addEventListener('keyup', event => this.handleKeyUp(event));
    }

    //Método de detección de pulsación de tecla. Se activa por el "escuchador". Pasa a true el objeto correspondiente de this.keys
    handleKey(event) {
        let keyboard = event.key; //Usamos aquí el let para no "pisar" variables con la siguiente función

        if (keyboard === 'ArrowLeft') {
            this.keys.ArrowLeft = true;
        } else if (keyboard === 'ArrowRight') {
            this.keys.ArrowRight = true;
        } else if (keyboard === 'ArrowUp') {
            this.keys.ArrowUp = true;
        } else if (keyboard === 'ArrowDown') {
            this.keys.ArrowDown = true;
        }else if (keyboard === ' ') {
            this.keys.Space = true;
        }
        //Al ejectuarse el método y pasar alguna tecla a true, seguidamente se ejectua la función que comprueba cuál o cuáles han pasado a true
        this.checkKey();
    }
    //Método de detección de liberación de tecla. Se activa por el "escuchador". Pasa a false el objeto correspondiente de this.keys. No es necesario
    //el checkKey
    handleKeyUp(event) {
        let keyboard = event.key;

        if (keyboard === 'ArrowLeft') {
            this.keys.ArrowLeft = false;
        } else if (keyboard === 'ArrowRight') {
            this.keys.ArrowRight = false;
        } else if (keyboard === 'ArrowUp') {
            this.keys.ArrowUp = false;
        } else if (keyboard === 'ArrowDown') {
            this.keys.ArrowDown = false;
        } else if (keyboard === ' ') {
            this.keys.Space = false;
        }
    }
    //Comprobador que es llamado cuando alguna tecla pasa a true. 
    checkKey() {
        const {ArrowUp, ArrowDown, ArrowRight, ArrowLeft} = this.keys; //Método de desestructuración de objetos. Se asignan valores a las variables,
                                                                              //y así evitamos tener que usar continuamente el this.keys.

        const carGame = this.game;
        const carConfig = carGame.config.car;

        if (ArrowUp && ArrowRight) {
            carConfig.position = "top_right";
        } else if (ArrowUp && ArrowLeft) {
            carConfig.position = "top_left";
        } else if (ArrowDown && ArrowRight) {
            carConfig.position = "down_right";
        } else if (ArrowDown && ArrowLeft) {
            carConfig.position = "down_left";
        } else if (ArrowUp) {
            carConfig.position = "top";
        } else if (ArrowDown) {
            carConfig.position = "down";
        } else if (ArrowRight) {
            carConfig.position = "right";
        } else if (ArrowLeft) {
            carConfig.position = "left";
        }
    }
}

window.onload = function(){
    game = new CarGame(1000, 500);
    teclado = new Teclado(game);
}
