// controllers/jobSearchController.js

const axios = require('axios');

exports.searchJobs = async (req, res) => {
    const { work, city, country } = req.query;

    const options = {
        method: 'GET',
        url: 'https://job-search-api1.p.rapidapi.com/v1/job-description-search',
        params: {
            q: work,
            page: '1',
            country: country || 'us', // Default country is 'us' if not provided
            city: city,
        },
        headers: {
            'X-RapidAPI-Key': 'fd57a8e4e9msh15a4fa5db28bd27p114c00jsn2b025cb0edb3',
            'X-RapidAPI-Host': 'job-search-api1.p.rapidapi.com'
        }
    };
    try {
        const response = await axios.request(options);
        res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
