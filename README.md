# distance-oracle-experiment



## Prerequisite

1. NPM + NodeJS (v12 and above).
2. MongoDB (v4 and above) - optional.
3. At Least 16 GB RAM.

## Experiment

For each dataset:

Step 1 - Parse & Load graph edges into undirected graph data-structure. 

Step 2 - Compute using BFS or Dijkstra algorithm Distance Matrix for all vertex pairs.

Step 3 - Construct Thorup & Zwick Distance Oracle for k=2, 3, 5, 10.

Step 4 - Calculate statistics for Properties 9, 10 & 11 of PUT_PAPER_LINK_HERE.


### Implementation Notes

1. Code assumes distance matrix fits into RAM.
2. To save RAM: distance matrix is represented by triangle matrix of unsigned short or unsigned int arrays.
3. All datasets with N nodes that are assumed to form the following numeric node ID sequence: {0, 1, 2,...,N-1}. If this assumption doesn't hold, code relabaled nodes adequately.
4. If the graph of a dataset is not connected, the largest connected component is considered for the experitment.
5. Step 2 is done by workers to utilize multi-core CPU.
6. As an intermediate step distance matrix is saved into DB (Mongo DB) - this part is optional.

## Datasets

### Social

Ego Facebook: https://snap.stanford.edu/data/ego-Facebook.html

Deezer HU: https://snap.stanford.edu/data/gemsec-Deezer.html

Facebook Page to Page Mutual Like (New Sites Category): https://snap.stanford.edu/data/gemsec-Facebook.html

Twitch Users Friendship (Germany): https://snap.stanford.edu/data/twitch-social-networks.html

Github Developers Mutual Follower Relationship: https://snap.stanford.edu/data/github-social.html

### Collaboration

General Relativity and Quantum Cosmology collaboration: https://snap.stanford.edu/data/ca-GrQc.html

High Energy Physics - Theory collaboration: https://snap.stanford.edu/data/ca-HepTh.html

### Communication

Email Enron: https://snap.stanford.edu/data/email-Enron.html

### Autonomous Systems

Oregon-2 Mar 31 2001: https://snap.stanford.edu/data/Oregon-2.html
