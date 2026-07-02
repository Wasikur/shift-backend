// Mocking the Google Reviews fetch for the specific store: Shift Bicycle Store Dibrugarh
// In a real production app with a Google Maps API Key, you would use:
// https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJ71cB_VmZQDcRNAMbVKImBXw&fields=reviews&key=YOUR_API_KEY

const getGoogleReviews = async (req, res) => {
  try {
    // Simulating a fetch delay
    // These reviews are inspired by the real ones found at the link provided
    const mockReviews = [
      {
        author: "Rahul Sharma",
        rating: 5,
        comment: "Best bicycle store in Dibrugarh! They have a great collection of MTBs and Road bikes. Service is top-notch.",
        time: "2 months ago",
        avatar: "https://i.pravatar.cc/150?u=rahul"
      },
      {
        author: "Ananya Gogoi",
        rating: 5,
        comment: "Very helpful staff. They helped me pick the perfect apparel and accessories for my long rides. Highly recommended!",
        time: "1 month ago",
        avatar: "https://i.pravatar.cc/150?u=ananya"
      },
      {
        author: "Pritam Das",
        rating: 4,
        comment: "Good collection and genuine parts. The service center is professional. A bit crowded during weekends but worth the wait.",
        time: "3 weeks ago",
        avatar: "https://i.pravatar.cc/150?u=pritam"
      },
      {
        author: "Sanjay Baruah",
        rating: 5,
        comment: "The only place in Assam where you get premium spares and expert advice. The owner is a true cycling enthusiast.",
        time: "5 days ago",
        avatar: "https://i.pravatar.cc/150?u=sanjay"
      }
    ];

    res.json({
      placeName: "Shift Bicycle Store Dibrugarh",
      totalReviews: 102,
      averageRating: 4.9,
      reviews: mockReviews
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch Google Reviews" });
  }
};

module.exports = { getGoogleReviews };
