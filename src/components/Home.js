import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardMedia,
  CardContent,
  AccordionSummary,
  Accordion,
  AccordionDetails,
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { debounce } from "lodash";
import { format } from "date-fns";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Reviews from "./Reviews";

const Home = ({ apiKey }) => {
  const [genres, setGenres] = useState([]);
  console.log("🚀 ~ file: Home.js:26 ~ Home ~ genres:", genres);
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [tvMovieShows, setTvMovieShows] = useState([]);
  const [reviews, setReviews] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [movieReviews, showMovieReviews] = useState(false);
  const [tvReviews, showTvReviews] = useState(true);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleGenreChange = (event) => {
    setGenre(event.target.value);
    debouncedSearch();
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
    debouncedSearch();
  };

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`);
        setGenres(response.data.genres);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${encodeURIComponent(
          genre
        )}&primary_release_year=${year}`
      );
      setTvMovieShows(response.data.results);
      showMovieReviews(!movieReviews);
      showTvReviews(!tvReviews);
    } catch (error) {
      console.error("Error searching movies:", error);
    }
  };

  const debouncedSearch = debounce(handleSearch, 500);

  const handleReviewSubmit = async (movieId, rating, comment) => {
    try {
      // Make an API request to submit the review for the movie
      const response = await axios.post(`https://api.themoviedb.org/3/movie/${movieId}/rating?api_key=${apiKey}`, {
        rating,
        comment,
      });
      console.log("Review submitted:", response.data);

      // Update the reviews state with the submitted review
      setReviews((prevReviews) => ({
        ...prevReviews,
        [movieId]: response.data,
      }));
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  useEffect(() => {
    const fetchtvMovieShows = async () => {
      try {
        const currentDate = new Date();
        const previousDate = new Date();
        previousDate.setDate(currentDate.getDate() - 7);
        const formattedCurrentDate = currentDate.toISOString().split("T")[0];
        const formattedPreviousDate = previousDate.toISOString().split("T")[0];
        const response = await axios.get(
          `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&sort_by=popularity.desc&air_date.gte=${formattedPreviousDate}&air_date.lte=${formattedCurrentDate}`
        );
        console.log("🚀 ~ file: Home.js:111 ~ fetchtvMovieShows ~ response:", response);
        setTvMovieShows(response.data.results);
      } catch (error) {
        console.error("Error fetching trending shows:", error);
      }
    };
    fetchtvMovieShows();
  }, [apiKey]);

  return (
    <Box>
      <FormControl variant="outlined">
        <Grid container spacing={5}>
          <Grid item sm={6}>
            <InputLabel id="genre-label">Genre</InputLabel>
            <Select
              fullWidth={true}
              sx={{ minWidth: 300 }}
              onChange={handleGenreChange}
              labelId="genre-label"
              label="Genre"
              defaultValue=""
            >
              <MenuItem selected value="">
                All Genres
              </MenuItem>
              {genres.map((genre) => (
                <MenuItem key={genre.id} value={genre.id}>
                  {genre.name}
                </MenuItem>
              ))}
              {/* Add more genre options */}
            </Select>
          </Grid>
          <Grid item sm={6}>
            <TextField
              fullWidth={true}
              sx={{ minWidth: 300 }}
              variant="outlined"
              label="Year"
              type="number"
              onChange={handleYearChange}
              InputProps={{
                inputProps: {
                  min: 1900, // Minimum allowed year
                  max: 2023, // Maximum allowed year
                },
              }}
            />
          </Grid>
        </Grid>
      </FormControl>

      <Grid sx={{ paddingTop: 2 }} container spacing={2}>
        {tvMovieShows.map((media, index) => (
          <Grid key={media.id} item xs={12} sm={6} md={4} lg={3}>
            <Card>
              <CardMedia
                component="img"
                height="300"
                image={`https://image.tmdb.org/t/p/w500/${media.poster_path}`}
                alt={media.name}
              />
              <CardContent>
                {media.name ? <Typography variant="h5">{media.name}</Typography> : null}
                {media.title ? <Typography variant="h6">{media.title}</Typography> : null}

                {media.first_air_date ? (
                  <Typography>First air date: {format(new Date(media.first_air_date), "eee do MMM")}</Typography>
                ) : null}
                {media.release_date ? (
                  <Typography>
                    Release date:
                    {format(new Date(media.release_date), "eee do MMM")}
                  </Typography>
                ) : null}

                <Typography>Average vote: {media.vote_average}</Typography>

                {tvReviews ? (
                  <>
                    <Typography className="mt-2" variant="h5">
                      Reviews
                    </Typography>
                    <Reviews apiKey={apiKey} mediaId={media.id} type="tv" />
                  </>
                ) : null}

                {movieReviews ? (
                  <Accordion expanded={expanded === `panel${index}`} onChange={handleChange(`panel${index}`)}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel${index}bh-content`}
                      id={`panel${index}bh-header`}
                    >
                      <Typography sx={{ width: "33%", flexShrink: 0 }}>See Reviews</Typography>

                      <Typography sx={{ color: "text.secondary" }}>
                        {/* Display the submitted review, if available */}
                        {reviews[media.id] && (
                          <div>
                            <Typography variant="h6">Submitted Review:</Typography>
                            <Typography>Rating: {reviews[media.id].rating}</Typography>
                            <Typography>Comment: {reviews[media.id].comment}</Typography>
                          </div>
                        )}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Reviews apiKey={apiKey} mediaId={media.id} type="movie" />

                      <Typography>
                        {/* Review form for each movie */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const rating = e.target.elements.rating.value;
                            const comment = e.target.elements.comment.value;
                            handleReviewSubmit(media.id, rating, comment);
                          }}
                        >
                          <TextField
                            name="rating"
                            type="number"
                            label="Rating"
                            inputProps={{ min: 1, max: 10 }}
                            required
                            fullWidth
                            className={"my-2"}
                          />
                          <TextField name="comment" label="Comment" multiline required fullWidth className={"my-2"} />
                          <Button type="submit" variant="contained" color="primary">
                            Submit Review
                          </Button>
                        </form>
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;
