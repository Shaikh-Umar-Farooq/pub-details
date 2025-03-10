# from flask import Flask, render_template, request, jsonify
# import mysql.connector
# import json
# import os
# from dotenv import load_dotenv 

# app = Flask(__name__)

# # Load variables from the .env file
# load_dotenv()


# def get_db_connection():
#     try:
#         connection = mysql.connector.connect(
#             host=os.environ.get("DB_HOST"),
#             user=os.environ.get("DB_USER"),
#             password=os.environ.get("DB_PASSWORD"),
#             database=os.environ.get("DB_NAME")
#         )
#         if connection.is_connected():
#             print("Connection established")
#         return connection
#     except mysql.connector.Error as err:
#         print(f"Error: {err}")
#         return None

# @app.route('/')
# def index():
#     return render_template('index.html')

# @app.route('/search_publishers', methods=['POST'])
# def search_publishers():
#     search_term = request.form.get('search_term', '')
    
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)
    
#     # Search by both ID and name
#     query = """
#         SELECT *
#         FROM publishers
#         WHERE id = %s OR subdomain LIKE %s
#         ORDER BY name
#         LIMIT 100
#     """
#     cursor.execute(query, (search_term, f'%{search_term}%'))
#     publishers = cursor.fetchall()
    
#     cursor.close()
#     conn.close()
    
#     return jsonify(publishers)

# @app.route('/search_games', methods=['POST'])
# def search_games():
#     search_term = request.form.get('search_term', '')
    
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)
    
#     # Search for games in tournaments table by name
#     query = """
#         SELECT *
#         FROM tournaments
#         WHERE name LIKE %s
#         ORDER BY name
#         LIMIT 100
#     """
#     cursor.execute(query, (f'%{search_term}%',))
#     games = cursor.fetchall()
    
#     cursor.close()
#     conn.close()
    
#     return jsonify(games)

# @app.route('/get_game_details/<game_id>')
# def get_game_details(game_id):
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)
    
#     # Get all game details from tournaments table
#     query = """
#         SELECT *
#         FROM tournaments
#         WHERE id = %s
#     """
#     cursor.execute(query, (game_id,))
#     game_details = cursor.fetchone()
    
    
    
#     cursor.close()
#     conn.close()
    
#     result = {
#         'game_details': game_details
#     }
    
#     return jsonify(result)

# # @app.route('/get_widgets/<publisher_id>')
# # def get_widgets(publisher_id):
# #     conn = get_db_connection()
# #     cursor = conn.cursor(dictionary=True)
    
# #     # Get widgets for the publisher with all fields
# #     query = """
# #         SELECT w.*, pwm.priority, pwm.type as map_type, pwm.status as map_status
# #         FROM widgets_1 w
# #         JOIN publishers_widgets_1_map pwm ON w.id = pwm.widgets_1_id
# #         WHERE pwm.publisher_id = %s
# #         ORDER BY pwm.status desc,pwm.priority
# #     """
# #     cursor.execute(query, (publisher_id,))
# #     widgets = cursor.fetchall()
    
# #     cursor.close()
# #     conn.close()
    
# #     return jsonify(widgets)

# # Add filter support to /get_widgets endpoint
# @app.route('/get_widgets/<publisher_id>')
# def get_widgets(publisher_id):
#     # Retrieve filters from query parameters (default to None or 'all')
#     filter_status = request.args.get('status', None)
#     filter_map_type = request.args.get('map_type', None)
    
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)
    
#     query = """
#         SELECT w.*, pwm.priority, pwm.type as map_type, pwm.status as map_status
#         FROM widgets_1 w
#         JOIN publishers_widgets_1_map pwm ON w.id = pwm.widgets_1_id
#         WHERE pwm.publisher_id = %s
#     """
#     params = [publisher_id]
    
#     if filter_status and filter_status == '1':
#         query += " AND (pwm.status = 1)"
#         params.extend([filter_status, filter_status])
        
#     if filter_map_type and filter_map_type != 'all':
#         query += " AND pwm.type = %s"
#         params.append(filter_map_type)
        
#     query += " ORDER BY pwm.status DESC, pwm.priority"
    
#     cursor.execute(query, tuple(params))
#     widgets = cursor.fetchall()
    
#     cursor.close()
#     conn.close()
    
#     return jsonify(widgets)


# @app.route('/get_widget_details/<widget_id>')
# def get_widget_details(widget_id):
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)
    
#     # Get widget elements with all fields
#     query = """
#         SELECT *
#         FROM widgets_element
#         WHERE widgets_1_id = %s
#         ORDER BY `order`
#     """
#     cursor.execute(query, (widget_id,))
#     elements = cursor.fetchall()
    
#     # If no elements found, check widget_carousel
#     if not elements:
#         query = """
#             SELECT *, w.lobby_id AS entity_id,t.name as name
# FROM widget_carousel AS w
# INNER JOIN tournaments AS t ON t.id = w.lobby_id
# WHERE w.widgets_1_id = %s
# ORDER BY w.priority;

#         """
#         cursor.execute(query, (widget_id,))
#         elements = cursor.fetchall()
        
#         # Mark these as carousel elements
#         for element in elements:
#             element['is_carousel'] = True
    
#     # Get API details
#     api_query = """
#         SELECT *
#         FROM widgets_apis
#         WHERE widget_1_id = %s
#     """
#     cursor.execute(api_query, (widget_id,))
#     api_details = cursor.fetchall()
    
#     # Format JSON data in api_details
#     for api in api_details:
#         if api.get('data_api_params'):
#             try:
#                 api['data_api_params'] = json.loads(api['data_api_params'])
#             except:
#                 api['data_api_params'] = api['data_api_params']
        
#         # Handle other JSON fields if they exist
#         for field in ['metadata']:
#             if api.get(field):
#                 try:
#                     api[field] = json.loads(api[field])
#                 except:
#                     pass
    
#     # Get related entity details based on element type
#     for element in elements:
#         # Format any JSON fields
#         for field in ['metadata']:
#             if element.get(field):
#                 try:
#                     element[field] = json.loads(element[field])
#                 except:
#                     pass
        
#         if element.get('type') == 1 and element.get('entity_id'):  # Tournament
#             query = """
#                 SELECT *
#                 FROM tournaments
#                 WHERE id = %s
#             """
#             cursor.execute(query, (element['entity_id'],))
#             tournament = cursor.fetchone()
#             if tournament:
#                 element['entity_details'] = tournament
#         elif element.get('type') == 3 and element.get('entity_id'):  # Video
#             query = """
#                 SELECT *
#                 FROM videos
#                 WHERE id = %s
#             """
#             cursor.execute(query, (element['entity_id'],))
#             video = cursor.fetchone()
#             if video:
#                 element['entity_details'] = video
#             else:
#                 element['entity_details'] = {'id': element['entity_id'], 'type': 'Video'}
#         elif element.get('type') == 5 and element.get('entity_id'):  # Show
#             query = """
#                 SELECT *
#                 FROM shows
#                 WHERE id = %s
#             """
#             cursor.execute(query, (element['entity_id'],))
#             show = cursor.fetchone()
#             if show:
#                 element['entity_details'] = show
#             else:
#                 element['entity_details'] = {'id': element['entity_id'], 'type': 'Show'}
    
#     cursor.close()
#     conn.close()
    
#     result = {
#         'elements': elements,
#         'api_details': api_details
#     }
    
#     return jsonify(result)

# if __name__ == '__main__':
#     app.run()




from flask import Flask, render_template, request, jsonify
import mysql.connector
import json
import os
from dotenv import load_dotenv

# Initialize the Flask app and load environment variables
app = Flask(__name__)
load_dotenv()


def get_db_connection():
    """
    Establish a connection to the MySQL database using credentials from environment variables.
    Returns the connection if successful, or None otherwise.
    """
    try:
        connection = mysql.connector.connect(
            host=os.environ.get("DB_HOST"),
            user=os.environ.get("DB_USER"),
            password=os.environ.get("DB_PASSWORD"),
            database=os.environ.get("DB_NAME")
        )
        if connection.is_connected():
            print("Database connection established.")
        return connection
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None


@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')


@app.route('/search_publishers', methods=['POST'])
def search_publishers():
    """Search for publishers by ID or subdomain."""
    search_term = request.form.get('search_term', '')
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT *
        FROM publishers
        WHERE id = %s OR subdomain LIKE %s
        ORDER BY name
        LIMIT 100
    """
    cursor.execute(query, (search_term, f'%{search_term}%'))
    publishers = cursor.fetchall()

    cursor.close()
    conn.close()
    return jsonify(publishers)


@app.route('/search_games', methods=['POST'])
def search_games():
    """Search for games (tournaments) by name."""
    search_term = request.form.get('search_term', '')
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT *
        FROM tournaments
        WHERE name LIKE %s
        ORDER BY name
        LIMIT 100
    """
    cursor.execute(query, (f'%{search_term}%',))
    games = cursor.fetchall()

    cursor.close()
    conn.close()
    return jsonify(games)


@app.route('/get_game_details/<game_id>')
def get_game_details(game_id):
    """Retrieve detailed information for a given game (tournament)."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    query = "SELECT * FROM tournaments WHERE id = %s"
    cursor.execute(query, (game_id,))
    game_details = cursor.fetchone()

    cursor.close()
    conn.close()
    return jsonify({"game_details": game_details})


@app.route('/get_widgets/<publisher_id>')
def get_widgets(publisher_id):
    """
    Retrieve widgets for a given publisher with optional filters.
    Query parameters:
      - status: widget status (use 'all' for no filter)
      - map_type: widget map type (use 'all' for no filter)
    """
    filter_status = request.args.get('status', 'all')
    filter_map_type = request.args.get('map_type', 'all')

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT w.*, pwm.priority, pwm.type as map_type, pwm.status as map_status
        FROM widgets_1 w
        JOIN publishers_widgets_1_map pwm ON w.id = pwm.widgets_1_id
        WHERE pwm.publisher_id = %s
    """
    params = [publisher_id]

    if filter_status != 'all':
        query += " AND pwm.status = %s"
        params.append(filter_status)

    if filter_map_type != 'all':
        query += " AND pwm.type = %s"
        params.append(filter_map_type)

    query += " ORDER BY pwm.status DESC, pwm.priority"
    cursor.execute(query, tuple(params))
    widgets = cursor.fetchall()

    cursor.close()
    conn.close()
    return jsonify(widgets)


@app.route('/get_widget_details/<widget_id>')
def get_widget_details(widget_id):
    """
    Retrieve widget details including elements and API configurations.
    If no elements are found in the widgets_element table, check the widget_carousel table.
    Additionally, parse any JSON fields from API details and related entities.
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    # Get widget elements
    query = """
        SELECT *
        FROM widgets_element
        WHERE widgets_1_id = %s
        ORDER BY `order`
    """
    cursor.execute(query, (widget_id,))
    elements = cursor.fetchall()

    # If no elements, check the carousel table
    if not elements:
        carousel_query = """
            SELECT *, w.lobby_id AS entity_id, t.name as name
            FROM widget_carousel AS w
            INNER JOIN tournaments AS t ON t.id = w.lobby_id
            WHERE w.widgets_1_id = %s
            ORDER BY w.priority
        """
        cursor.execute(carousel_query, (widget_id,))
        elements = cursor.fetchall()
        for element in elements:
            element['is_carousel'] = True

    # Retrieve API details
    api_query = "SELECT * FROM widgets_apis WHERE widget_1_id = %s"
    cursor.execute(api_query, (widget_id,))
    api_details = cursor.fetchall()

    # Parse JSON fields in API details
    for api in api_details:
        if api.get('data_api_params'):
            try:
                api['data_api_params'] = json.loads(api['data_api_params'])
            except json.JSONDecodeError:
                pass
        if api.get('metadata'):
            try:
                api['metadata'] = json.loads(api['metadata'])
            except json.JSONDecodeError:
                pass

    # Retrieve related entity details for each element
    for element in elements:
        if element.get('metadata'):
            try:
                element['metadata'] = json.loads(element['metadata'])
            except json.JSONDecodeError:
                pass

        entity_id = element.get('entity_id')
        if not entity_id:
            continue

        if element.get('type') == 1:  # Tournament
            cursor.execute("SELECT * FROM tournaments WHERE id = %s", (entity_id,))
            tournament = cursor.fetchone()
            if tournament:
                element['entity_details'] = tournament
        elif element.get('type') == 3:  # Video
            cursor.execute("SELECT * FROM videos WHERE id = %s", (entity_id,))
            video = cursor.fetchone()
            element['entity_details'] = video if video else {'id': entity_id, 'type': 'Video'}
        elif element.get('type') == 5:  # Show
            cursor.execute("SELECT * FROM shows WHERE id = %s", (entity_id,))
            show = cursor.fetchone()
            element['entity_details'] = show if show else {'id': entity_id, 'type': 'Show'}

    cursor.close()
    conn.close()
    return jsonify({"elements": elements, "api_details": api_details})


if __name__ == '__main__':
    app.run()
