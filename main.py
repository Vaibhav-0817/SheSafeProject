from functions import *

# Step 1: Clustering with DBSCAN (initial state assignment)
coordinates = load_coordinates_from_csv('C:\\Users\\VAIBHAV\\Desktop\\SIH001\\assets for map\\training dataset.csv')
epsilon = 0.00009
min_samples = 5
cluster_labels = dbscan_clustering(coordinates, epsilon, min_samples)

# Calculate cluster centers
cluster_centers = []
unique_clusters = np.unique(cluster_labels)
for cluster in unique_clusters:
    cluster_points = coordinates[cluster_labels == cluster]
    cluster_center = np.mean(cluster_points, axis=0)
    cluster_centers.append(cluster_center)
cluster_centers = np.array(cluster_centers)

# Assuming you want to draw boundaries around clusters, create a list of cluster_points
cluster_points = [coordinates[cluster_labels == cluster] for cluster in unique_clusters]


# Step 2: State Assignment (initial assignment based on majority)
state_names = load_state_names_from_csv('C:\\Users\\VAIBHAV\\Desktop\\SIH001\\assets for map\\training dataset.csv')

state_assignments = assign_states_to_clusters(cluster_labels, state_names)
print(state_assignments)
print(cluster_labels)
print(cluster_centers)

# Step 3: SVM Training for Each Cluster
svm_models = train_svm_models(coordinates, cluster_labels)
print(svm_models)



import pymongo
import time
# Replace 'your_uri_here', 'my_database', and 'my_collection' with your actual information
uri = 'process.env.MONGO_DB_URI'
client = pymongo.MongoClient(uri)

db = client['sihDB']
collection = db['complaints']
# Fetch all documents from the collection (you can add filters as needed)
cursor = collection.find({})

# Convert the cursor to a pandas DataFrame
df = pd.DataFrame(list(cursor))

# Replace 'output.csv' with your desired CSV file name
output_file = 'output.csv'
df.to_csv(output_file, index=False)

print(f'Data has been exported to {output_file}')
pipeline = [{'$match': {'operationType': 'insert'}}]  # Watch for insert operations

change_stream = collection.watch(pipeline=pipeline)

for change in change_stream:
    # Trigger your script or function here
    print("New entry detected:", change)

    # Step 4: Predicting New Coordinates with SVM models
    test_coordinates = load_test_coordinates_from_csv('C:\\Users\\VAIBHAV\\Desktop\\SIH001\\output.csv')

    # Combine training and test coordinates
    combined_coordinates = np.vstack((coordinates, test_coordinates))

    # Step 3: Re-clustering with DBSCAN (to adjust clusters)
    epsilon = 0.00009
    min_samples = 4
    updated_cluster_labels = recluster(combined_coordinates, epsilon, min_samples)

    print(updated_cluster_labels)

    # Step 4: Remove clusters with fewer than 4 coordinates
    min_cluster_size = 4
    cluster_sizes = [np.sum(updated_cluster_labels == i) for i in range(np.min(updated_cluster_labels), np.max(updated_cluster_labels) + 1)]
    print(cluster_sizes)
    clusters_to_keep = [np.unique(updated_cluster_labels)[i] for i, size in enumerate(cluster_sizes) if size >= min_cluster_size]
    print(clusters_to_keep)

    # Filter out clusters and their corresponding coordinates
    filtered_cluster_labels = updated_cluster_labels[np.isin(updated_cluster_labels, clusters_to_keep)]
    filtered_coordinates = combined_coordinates[np.isin(updated_cluster_labels, clusters_to_keep)]

    # Filter test coordinates based on filtered cluster labels
    filtered_test_coordinates = np.array([coord for coord in test_coordinates if np.isin(coord, filtered_coordinates).all()])
    print(test_coordinates)
    print()
    print(filtered_test_coordinates)
    # Update cluster centers
    filtered_cluster_centers = []
    unique_filtered_clusters = np.unique(filtered_cluster_labels)
    for cluster in unique_filtered_clusters:
        cluster_points = filtered_coordinates[filtered_cluster_labels == cluster]
        cluster_center = np.mean(cluster_points, axis=0)
        filtered_cluster_centers.append(cluster_center)
    filtered_cluster_centers = np.array(filtered_cluster_centers)
    # Reuse the already trained SVM models for prediction
    if filtered_test_coordinates.size>0:
        # Step 5: Predicting New Coordinates with SVM models
        predicted_coordinates = predict_coordinates(filtered_test_coordinates, svm_models, filtered_cluster_labels, filtered_cluster_centers)
        # Step 6: Re-clustering with DBSCAN (using all coordinates)
        combined_coordinates = np.vstack((filtered_coordinates, predicted_coordinates))
    epsilon = 0.00009
    min_samples = 5
    final_cluster_labels = recluster(combined_coordinates, epsilon, min_samples)
    updated_state_assignments = reassign_states_after_reclustering(final_cluster_labels, cluster_labels, state_assignments)
    cluster_coordinates = [combined_coordinates[final_cluster_labels == label] for label in np.unique(cluster_labels)]
    boundaries = predict_cluster_boundaries(cluster_coordinates)


    import folium
    import numpy as np
    from scipy.spatial import ConvexHull

    # Function to create a Folium map
    def create_folium_map(center, zoom_start):
        return folium.Map(location=center, zoom_start=zoom_start)
    def state_to_color(state):
        # Define a mapping of states to colors
        state_colors = {
            'State1': 'red',
            'State2': 'blue',
            'State3': 'green',
            'State4': 'pink',
            'State5': 'yellow',
            'State6': 'purple',
            'State7': 'orange',
            # Add more states and colors as needed
        }
        
        # Return the color for the given state, or a default color if not found
        return state_colors.get(state, 'gray')


    # Function to map state boundaries as polygons
    def plot_state_boundaries_on_map(m, state_boundaries, state_assignments):
        for i, state_boundary in enumerate(state_boundaries):
            cluster_label = np.unique(final_cluster_labels)[i]
            state_name = state_assignments[cluster_label]
            state_polygon = folium.Polygon(
                locations=state_boundary.tolist(),
                popup=f'State: {state_name}',
                color='black',  # Boundary color
                fillColor='black',  # Fill color
                fill=True,  # Fill the polygon
                fillOpacity=0.2,  # Fill opacity
                weight=2  # Boundary weight
            )
            state_polygon.add_to(m)
    # Create a Folium map
    center = [28.719493, 77.066194]
    zoom_start = 20
    m = create_folium_map(center, zoom_start)

    # Plot clustered coordinates on the map
    # plot_clustered_coordinates_on_map(m, combined_coordinates, final_cluster_labels, updated_state_assignments)
    n_clusters = len(np.unique(final_cluster_labels))
    # update cluster centres
    unique_clusters = np.unique(final_cluster_labels)
    cluster_centers = []
    for cluster in unique_clusters:
        cluster_points = combined_coordinates[final_cluster_labels == cluster]
        cluster_center = np.mean(cluster_points, axis=0)
        cluster_centers.append(cluster_center)
    cluster_centers = np.array(cluster_centers)

    for label in unique_clusters:
        cluster_center = cluster_centers[label]
        folium.Marker(
            location=[cluster_center[0], cluster_center[1]],
            popup=f'Black Spot {label}',
            icon=folium.Icon(color='black')
        ).add_to(m)

    state_boundaries = []
    for cluster_id in range(n_clusters):
        cluster_points = combined_coordinates[final_cluster_labels == cluster_id]
        if len(cluster_points) > 0:  # Check if there are points in the cluster
            hull = ConvexHull(cluster_points)
            state_boundary = cluster_points[hull.vertices]
            state_boundaries.append(state_boundary)


    # Plot state boundaries on the map
    print(updated_state_assignments)
    plot_state_boundaries_on_map(m, state_boundaries, updated_state_assignments)

    # Save or display the map
    m.save('C:\\Users\\VAIBHAV\\Desktop\\SIH001\\public\\map.html')