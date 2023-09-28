from sklearn.cluster import DBSCAN
import numpy as np
from collections import Counter

def dbscan_clustering(coordinates, epsilon, min_samples):
    dbscan = DBSCAN(eps=epsilon, min_samples=min_samples)
    cluster_labels = dbscan.fit_predict(coordinates)
    return cluster_labels

def assign_states_to_clusters(cluster_labels, state_names):
    unique_clusters = np.unique(cluster_labels)
    state_assignments = {}
    
    for cluster in unique_clusters:
        cluster_indices = np.where(cluster_labels == cluster)[0]
        cluster_state_names = state_names[cluster_indices]
        
        # Find the most common state name within the cluster using Counter
        most_common_state = Counter(cluster_state_names).most_common(1)[0][0]
        state_assignments[cluster] = most_common_state
    
    return state_assignments

def reassign_states_after_reclustering(updated_cluster_labels, previous_cluster_labels, previous_state_assignments):
    unique_clusters = np.setdiff1d(updated_cluster_labels, previous_cluster_labels)

    # Convert existing_states to a Python list
    existing_states = list(previous_state_assignments.values())

    # Create a dictionary to store the cluster label and corresponding state name
    reassigned_state_names = previous_state_assignments
    
    for cluster in unique_clusters:
        if cluster in previous_state_assignments:
            # If the cluster existed in the previous state assignments, use the old state name
            reassigned_state_names[cluster] = previous_state_assignments[cluster]
        else:
            # If it's a new cluster label, assign a random state name
            random_state_name = generate_random_state_name(existing_states)
            reassigned_state_names[cluster] = random_state_name
    
    return reassigned_state_names

def generate_random_state_name(existing_states):
    # Generate a random state name that doesn't exist in existing_states
    while True:
        random_state_name = "State" + str(np.random.randint(1, 1000))
        if random_state_name not in existing_states:
            existing_states.append(random_state_name)  # Ensure it doesn't repeat
            return random_state_name

from sklearn.svm import SVR

def train_svm_models(coordinates, cluster_labels):
    svm_models = {}
    unique_clusters = np.unique(cluster_labels)
    
    for cluster in unique_clusters:
        cluster_coordinates = coordinates[cluster_labels == cluster]
        svr_longitude = SVR(kernel='rbf', C=100, gamma=0.1, epsilon=.1)
        svr_latitude = SVR(kernel='rbf', C=100, gamma=0.1, epsilon=.1)
        svr_longitude.fit(cluster_coordinates[:, 0].reshape(-1, 1), cluster_coordinates[:, 1])
        svr_latitude.fit(cluster_coordinates[:, 1].reshape(-1, 1), cluster_coordinates[:, 0])
        svm_models[cluster] = (svr_longitude, svr_latitude)
    
    return svm_models
def predict_coordinates(test_coordinates, svm_models, cluster_labels, cluster_centers):
    predicted_coordinates = []

    for test_coord in test_coordinates:
        cluster_sizes = [np.sum(cluster_labels == i) for i in range(len(svm_models))]

        # Choose the cluster with the largest number of points as the model to use
        selected_cluster = np.argmax(cluster_sizes)
        svr_longitude, svr_latitude = svm_models[selected_cluster]

        # Generate coordinates around the test coordinate with 1-meter spacing
        for delta_lat in range(-4, 5):  # Adjust the range as needed
            for delta_lon in range(-4, 5):  # Adjust the range as needed
                lat = test_coord[0] + delta_lat * 0.00001  # 0.00001 degree is approximately 1 meter
                lon = test_coord[1] + delta_lon * 0.00001
                predicted_coordinates.append([lon,lat])

    return np.array(predicted_coordinates)
def recluster(coordinates, epsilon, min_samples):
    dbscan = DBSCAN(eps=epsilon, min_samples=min_samples)
    cluster_labels = dbscan.fit_predict(coordinates)
    return cluster_labels
from shapely.geometry import Polygon

def predict_cluster_boundaries(cluster_coordinates):
    boundaries = []
    
    for cluster_coords in cluster_coordinates:
        hull = Polygon(cluster_coords).convex_hull
        boundaries.append(hull)
    return boundaries
import pandas as pd

def load_coordinates_from_csv(csv_file):
    df = pd.read_csv(csv_file)
    coordinates = df[['latitude','longitude']].values
    return coordinates

def load_state_names_from_csv(csv_file):
    df = pd.read_csv(csv_file)
    state_names = df['state'].values
    return state_names

def load_test_coordinates_from_csv(csv_file):
    df = pd.read_csv(csv_file)
    test_coordinates = df[['longitude','latitude']].values
    return test_coordinates
