
//file is used to fill database with seed/filler entries of fake campsites



const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require ('../models/campground');


//connect mongoose to mongodb server
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});


//confirm database connection
const db = mongoose.connection;
db.on('error',console.error.bind('connection error:'));
db.once('open', () => {
    console.log("database connected");
});

//helper function to select a random array item
const sample = array => array[Math.floor(Math.random() * array.length)];

//delete existing database data and refill with generic options
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            image: 'https://source.unsplash.com/random',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam faucibus purus lorem, et blandit libero mattis in. Cras lobortis magna lorem, sit amet blandit purus fringilla vel. Donec blandit aliquet ipsum ac mattis. Sed vehicula nisl justo, sit amet blandit mi eleifend eu. Proin vitae tempor ipsum. Nulla facilisi. Aenean auctor lectus ligula, ac finibus neque accumsan hendrerit. Nullam vel congue lacus, a scelerisque massa. Aenean blandit, magna sit amet semper ullamcorper, erat enim luctus nulla, sit amet pulvinar est risus nec urna. Quisque mauris massa, semper sed fermentum vitae, congue aliquet odio. Nullam lectus ipsum, rhoncus id lectus vitae, porttitor pretium nunc. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Duis a volutpat felis.',
            price: price
        });
        await camp.save();
    }
    
}
    

seedDB().then(()=> {
    mongoose.connection.close();
})