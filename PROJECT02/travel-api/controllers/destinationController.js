/**
 * Destination Controller
 * Handles operations related to travel destinations
 */

// 34 Famous Indian Destinations (matching frontend data)
const destinations = [
    { name: "Taj Mahal, Agra", price: "₹5,000", rating: "4.9", desc: "A symbol of love and a UNESCO World Heritage Site.", id: "agra", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/500px-Taj_Mahal_%28Edited%29.jpeg" },
    { name: "Jaipur, Rajasthan", price: "₹7,500", rating: "4.7", desc: "The Pink City known for its stunning forts and Hawa Mahal palace.", id: "jaipur", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/500px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg" },
    { name: "Varanasi, UP", price: "₹4,000", rating: "4.8", desc: "The spiritual capital of India on the banks of river Ganga.", id: "varanasi", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Varanasi%2C_India%2C_Ghats%2C_Cremation_ceremony_in_progress.jpg/500px-Varanasi%2C_India%2C_Ghats%2C_Cremation_ceremony_in_progress.jpg" },
    { name: "Leh Ladakh", price: "₹15,000", rating: "4.9", desc: "Breathtaking landscapes, high passes, and Buddhist monasteries.", id: "ladakh", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Road_Padum_Zanskar_Range_Jun24_A7CR_00818.jpg/500px-Road_Padum_Zanskar_Range_Jun24_A7CR_00818.jpg" },
    { name: "Goa Beaches", price: "₹10,000", rating: "4.8", desc: "Famous for its pristine beaches, nightlife, and Portuguese heritage.", id: "goa", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/BeachFun.jpg/500px-BeachFun.jpg" },
    { name: "Alleppey, Kerala", price: "₹8,000", rating: "4.7", desc: "Experience the tranquil backwaters in a traditional houseboat.", id: "alleppey", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Alappuzha_Boat_Beauty_W.jpg/500px-Alappuzha_Boat_Beauty_W.jpg" },
    { name: "Rishikesh", price: "₹4,500", rating: "4.6", desc: "The Yoga capital of the world and a hub for river rafting.", id: "rishikesh", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Trayambakeshwar_Temple_VK.jpg/500px-Trayambakeshwar_Temple_VK.jpg" },
    { name: "Darjeeling", price: "₹6,000", rating: "4.7", desc: "Queen of the Hills, famous for tea gardens and toy train.", id: "darjeeling", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/DarjeelingTrainFruitshop_%282%29.jpg/500px-DarjeelingTrainFruitshop_%282%29.jpg" },
    { name: "Munnar, Kerala", price: "₹7,000", rating: "4.8", desc: "Idyllic hill station with sprawling tea plantations.", id: "munnar", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Munnar_Overview.jpg/500px-Munnar_Overview.jpg" },
    { name: "Udaipur, Rajasthan", price: "₹9,000", rating: "4.9", desc: "City of Lakes, known for its majestic City Palace and Lake Palace.", id: "udaipur", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Evening_view%2C_City_Palace%2C_Udaipur.jpg/500px-Evening_view%2C_City_Palace%2C_Udaipur.jpg" },
    { name: "Andaman Islands", price: "₹20,000", rating: "4.9", desc: "Tropical paradise perfect for scuba diving and relaxing.", id: "andaman", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/The_Coral_Reef_at_the_Andaman_Islands.jpg/500px-The_Coral_Reef_at_the_Andaman_Islands.jpg" },
    { name: "Hampi, Karnataka", price: "₹5,500", rating: "4.8", desc: "Ancient village with fascinating ruins of the Vijayanagara Empire.", id: "hampi", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg/500px-Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg" },
    { name: "Ranthambore", price: "₹8,500", rating: "4.6", desc: "One of the best places in India to spot wild Bengal tigers.", id: "ranthambore", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Tiger_in_Ranthambhore.jpg/500px-Tiger_in_Ranthambhore.jpg" },
    { name: "Shimla, HP", price: "₹6,500", rating: "4.5", desc: "Historic hill station featuring colonial architecture and snow.", id: "shimla", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Landscape_of_Shimla_%2C_Himachal_Pradesh.jpg/500px-Landscape_of_Shimla_%2C_Himachal_Pradesh.jpg" },
    { name: "Manali, HP", price: "₹7,500", rating: "4.7", desc: "A high-altitude Himalayan resort town famous for adventure sports.", id: "manali", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Manali_City.jpg/500px-Manali_City.jpg" },
    { name: "Srinagar, J&K", price: "₹12,000", rating: "4.8", desc: "Heaven on Earth, known for its beautiful Dal Lake and Shikaras.", id: "srinagar", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Dal_Lake_Hazratbal_Srinagar.jpg/500px-Dal_Lake_Hazratbal_Srinagar.jpg" },
    { name: "Jaisalmer", price: "₹8,000", rating: "4.7", desc: "The Golden City located in the heart of the Thar Desert.", id: "jaisalmer", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Jaisalmer_Fort.jpg/500px-Jaisalmer_Fort.jpg" },
    { name: "Khajuraho", price: "₹5,000", rating: "4.6", desc: "Stunning ancient temples famous for their intricate sculptures.", id: "khajuraho", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/1_Khajuraho.jpg/500px-1_Khajuraho.jpg" },
    { name: "Ajanta & Ellora", price: "₹4,000", rating: "4.8", desc: "Ancient rock-cut caves featuring masterful Buddhist art.", id: "ajanta", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Ajanta_%2863%29.jpg/500px-Ajanta_%2863%29.jpg" },
    { name: "Mysore, Karnataka", price: "₹5,500", rating: "4.6", desc: "Famous for the magnificent Mysore Palace and silk sarees.", id: "mysore", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mysore_Palace_Morning.jpg/500px-Mysore_Palace_Morning.jpg" },
    { name: "Kanyakumari", price: "₹6,000", rating: "4.5", desc: "The southernmost tip of India where three oceans meet.", id: "kanyakumari", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Vivekananda_Rock_Memorial%2C_Kanyakumari.jpg/500px-Vivekananda_Rock_Memorial%2C_Kanyakumari.jpg" },
    { name: "Madurai", price: "₹4,500", rating: "4.7", desc: "An ancient city dominated by the colourful Meenakshi Amman Temple.", id: "madurai", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg/500px-An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg" },
    { name: "Kaziranga", price: "₹9,000", rating: "4.8", desc: "Home to the world's largest population of one-horned rhinoceroses.", id: "kaziranga", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Beauty_of_Kaziranga_National_Park.jpg/500px-Beauty_of_Kaziranga_National_Park.jpg" },
    { name: "Tawang", price: "₹11,000", rating: "4.7", desc: "Beautiful mountainous town famous for the Tawang Monastery.", id: "tawang", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/TawangMonastery.jpg/500px-TawangMonastery.jpg" },
    { name: "Gangtok, Sikkim", price: "₹8,000", rating: "4.6", desc: "A pristine hill station offering views of Mt. Kanchenjunga.", id: "gangtok", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Kangch-Goechala.jpg/500px-Kangch-Goechala.jpg" },
    { name: "Ooty, TN", price: "₹6,000", rating: "4.5", desc: "Popular hill station in the Nilgiri hills known for its landscapes.", id: "ooty", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Ooty_lake.jpg/500px-Ooty_lake.jpg" },
    { name: "Coorg, Karnataka", price: "₹7,000", rating: "4.6", desc: "The Scotland of India, famous for coffee plantations and mist.", id: "coorg", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Raja%27s_Seat_View_Point.jpg/500px-Raja%27s_Seat_View_Point.jpg" },
    { name: "Pondicherry", price: "₹6,500", rating: "4.7", desc: "A charming coastal city with French colonial legacy.", id: "pondicherry", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Pondicherry-Rock_beach_aerial_view.jpg/500px-Pondicherry-Rock_beach_aerial_view.jpg" },
    { name: "Mahabaleshwar", price: "₹5,000", rating: "4.5", desc: "A forested hill station known for its strawberries and viewpoints.", id: "mahabaleshwar", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/MAHABALESWAR_LANDSCAPE.jpg/500px-MAHABALESWAR_LANDSCAPE.jpg" },
    { name: "Nainital", price: "₹6,000", rating: "4.6", desc: "A beautiful Himalayan resort town set around a serene lake.", id: "nainital", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Nainital_metro.jpg/500px-Nainital_metro.jpg" },
    { name: "Rann of Kutch", price: "₹8,000", rating: "4.8", desc: "A massive expanse of white salt desert in Gujarat.", id: "kutch", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Rann_of_Kutch_-_White_Desert.jpg/500px-Rann_of_Kutch_-_White_Desert.jpg" },
    { name: "Cherrapunji", price: "₹9,000", rating: "4.7", desc: "One of the wettest places on Earth, famous for living root bridges.", id: "cherrapunji", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Cherrapunji.jpg/500px-Cherrapunji.jpg" },
    { name: "Valley of Flowers", price: "₹10,000", rating: "4.9", desc: "A vibrant national park in Uttarakhand known for endemic flora.", id: "valley", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Valley_of_flowers_national_park%2C_Uttarakhand%2C_India_03_%28edit%29.jpg/500px-Valley_of_flowers_national_park%2C_Uttarakhand%2C_India_03_%28edit%29.jpg" },
    { name: "Amritsar", price: "₹4,500", rating: "4.8", desc: "Home to the spectacular Golden Temple, the spiritual center of Sikhism.", id: "amritsar", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/The_Golden_Temple_of_Amrithsar_7.jpg/500px-The_Golden_Temple_of_Amrithsar_7.jpg" }
];

/**
 * @desc    Get all destinations with optional search filtering
 * @route   GET /api/destinations
 * @access  Public
 */
const getDestinations = (req, res, next) => {
    try {
        const { search } = req.query;
        let filteredDestinations = [...destinations];

        if (search) {
            const query = search.toLowerCase().trim();
            filteredDestinations = destinations.filter(dest => 
                dest.name.toLowerCase().includes(query) || 
                dest.desc.toLowerCase().includes(query)
            );
        }

        res.status(200).json({
            success: true,
            message: search 
                ? `Found ${filteredDestinations.length} destinations matching "${search}"`
                : "Destinations retrieved successfully",
            data: filteredDestinations
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get a single destination by ID
 * @route   GET /api/destinations/:id
 * @access  Public
 */
const getDestinationById = (req, res, next) => {
    try {
        const { id } = req.params;
        const destination = destinations.find(dest => dest.id.toLowerCase() === id.toLowerCase());

        if (!destination) {
            return res.status(404).json({
                success: false,
                message: `Destination with ID "${id}" not found`,
                data: null
            });
        }

        res.status(200).json({
            success: true,
            message: "Destination retrieved successfully",
            data: destination
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDestinations,
    getDestinationById,
    destinations // Exported for potential reference elsewhere
};
