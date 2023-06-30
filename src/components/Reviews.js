import React, { useEffect, useState } from "react";
import axios from "axios";
import { Typography, Box, List, ListItem, ListItemText } from "@mui/material";

const Reviews = ({ apiKey, mediaId, type }) => {
  console.log("🚀 ~ file: reviews.js:6 ~ MovieReviews ~ mediaId:", mediaId);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/${type}/${mediaId}/reviews?api_key=${apiKey}`);
        setReviews(response.data.results);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [mediaId, apiKey, type]);

  return (
    <div>
      {reviews.length === 0 ? (
        <Typography variant="body1">No reviews available</Typography>
      ) : (
        <List sx={{ maxHeight: 400, overflow: "auto" }}>
          {reviews.map((review) => (
            <ListItem key={review.id}>
              <ListItemText
                primary={<Box component="div" dangerouslySetInnerHTML={{ __html: review.content }} />}
                secondary={
                  <Typography sx={{ marginTop: 3 }} variant="h5">
                    {review.author}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

export default Reviews;
