# Matching

This file is primarily for laying down the foundations of the matching logic for connecting dogs and breeders together to work their magic. Exact numbers in this file will likely change down the line based on how we feel things should be weighted. 

The goal is to make sure we suggest compatible and preferred dogs to each breeder that matches their preferences as best as possible. 

---

## Criteria and Scoring

We will be using a scoring system to make sure each match makes sense, where only the top scorers will be matched with other dogs. 

### Dog Attributes (15 Points Total)
- Breed Match
- Age
- Weight

### Health (50 Points Total)
- Compatible breed  
- Vet Documents  

### Breeder Preferences (15 Points Total)
- Temperament  
- Traits  

### Practicality (20 Points Total)
- Location / Distance  
- Available / Not Available  
- Verified Breeder  

---

## Rules and Thresholds

- In this set, the health section will play the largest role in the matching process.  
- If a dog is not a compatible breed, they will **NOT** be matched whatsoever.  
- If a dog is missing important vet documents, they will still be matched, though the score would be much lower and the breeders they are matched with would be notified about these missing documents.  

The weights of these scores will either be fine tuned for all breeds, or will be set by each breeder to their likeness.  

An initial default of these scores should be:  
- **Dog Attributes:** 15 Points total  
- **Health:** 50 Points total  
- **Breeder Preferences:** 15 Points total  
- **Practicality:** 20 Points total  

A maximum score in this case is 100 points, and thus a minimum is 0 points.  

For a dog to be considered for a match, they must achieve a point total of **65** as well as be a compatible breed. 

---

## AI Matching

In the future, we would also like to implement a machine learning algorithm to adjust these weights for the breeder based on how they are swiping for dogs.  

This agent will:  
- Look at each of the previous swipes  
- Consider common traits or criteria that are commonly rejected or accepted  
- Adjust weights to align with how the breeder swipes  

We would also like to include different reasons for why dogs are matched, such as:  
- Highlighting preferred temperaments  
- Showing that a % of previously matched dogs share nice traits  
