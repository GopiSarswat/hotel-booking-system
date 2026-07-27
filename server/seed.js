import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDatabase } from "./src/config/db.js";
import { User } from "./src/models/User.js";
import { Hotel } from "./src/models/Hotel.js";
import { Room } from "./src/models/Room.js";
import { Booking } from "./src/models/Booking.js";
import { Review } from "./src/models/Review.js";

const hotels = [
  ["Aravali House","Udaipur","12 Lake View Road, Udaipur","A quiet modern haveli overlooking the old city, pairing hand-carved stone with calm, contemporary rooms.",["Lake view","Infinity pool","WiFi","Breakfast"],["https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1600&q=85","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"]],
  ["The Colaba Edit","Mumbai","Apollo Bunder, Colaba, Mumbai","A design-forward city hideaway near the waterfront, made for unhurried breakfasts and late-night walks.",["Rooftop bar","WiFi","Gym","Airport transfer"],["https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1600&q=85","https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"]],
  ["Pine & Peak Lodge","Manali","Old Manali Road, Himachal Pradesh","Warm timber, mountain air, and floor-to-ceiling valley views in a lodge built for slow weekends.",["Mountain view","Fireplace","Breakfast","Parking"],["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85","https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80"]],
  ["Casa Serein","Goa","Ashwem Beach Road, North Goa","A breezy coastal retreat of lime-washed walls, shaded courtyards, and an easy walk to the sea.",["Beach access","Pool","Spa","WiFi"],["https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1600&q=85","https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80"]],
  ["The Residency No. 7","Jaipur","C-Scheme, Jaipur","Colour, craft, and considered hospitality in a restored townhouse at the heart of the Pink City.",["Courtyard","Restaurant","WiFi","Guided tours"],["https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=85","https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"]],
  ["Backwater Atelier","Alappuzha","Punnamada Lake, Kerala","A low-slung waterside stay where every room opens to coconut palms, still water, and golden evenings.",["Lake view","Kayaks","Breakfast","Yoga"],["https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=85","https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=80"]],
  ["Mist House","Munnar","Tea Estate Road, Munnar","Minimal rooms floating above rolling tea gardens, with misty mornings and thoughtful local food.",["Tea garden","Hiking","Restaurant","WiFi"],["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=85","https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"]],
  ["Indigo Courtyard","Puducherry","Rue Suffren, White Town","French-era bones meet modern Indian design in an intimate courtyard hotel minutes from the promenade.",["Courtyard","Cycles","Breakfast","WiFi"],["https://images.unsplash.com/photo-1587985064135-0366536eab42?auto=format&fit=crop&w=1600&q=85","https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1200&q=80"]]
];

async function seed() {
  await connectDatabase();
  await Promise.all([User.deleteMany(), Hotel.deleteMany(), Room.deleteMany(), Booking.deleteMany(), Review.deleteMany()]);
  const passwordHash = await bcrypt.hash("Password123!", 12);
  const [admin, demo] = await User.create([
    { name: "Stayora Admin", email: "admin@stayora.com", passwordHash, role: "admin" },
    { name: "Demo Traveller", email: "demo@stayora.com", passwordHash, role: "user" },
  ]);
  const createdHotels = await Hotel.insertMany(hotels.map(([name,city,address,description,amenities,images],i)=>({name,city,address,description,amenities,images,avgRating:4.3+(i%5)*.1,numReviews:12+i*3,createdBy:admin._id})));
  const roomDocs = createdHotels.flatMap((hotel,index)=>[
    {hotel:hotel._id,type:"standard",name:"The Essential",pricePerNight:4200+index*350,capacity:2,totalUnits:4,amenities:["Queen bed","Rain shower","WiFi"],images:hotel.images},
    {hotel:hotel._id,type:"deluxe",name:"The Retreat",pricePerNight:6500+index*450,capacity:3,totalUnits:3,amenities:["King bed","Lounge","Breakfast"],images:hotel.images},
    {hotel:hotel._id,type:"suite",name:"The Grand Suite",pricePerNight:9800+index*600,capacity:4,totalUnits:2,amenities:["Living room","Bathtub","Best view"],images:hotel.images},
  ]);
  const createdRooms=await Room.insertMany(roomDocs);
  const today=new Date(), future=new Date(today);future.setDate(future.getDate()+30);const checkout=new Date(future);checkout.setDate(checkout.getDate()+3);
  await Booking.create({user:demo._id,hotel:createdHotels[0]._id,room:createdRooms[1]._id,checkIn:future,checkOut:checkout,guests:2,totalPrice:createdRooms[1].pricePerNight*3,status:"confirmed",paymentStatus:"paid"});
  console.log("Seed complete.");
  console.log("Admin: admin@stayora.com / Password123!");
  console.log("User:  demo@stayora.com / Password123!");
  await mongoose.disconnect();
}

seed().catch(async (error)=>{console.error(error);await mongoose.disconnect();process.exit(1);});

