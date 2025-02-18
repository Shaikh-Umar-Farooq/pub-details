from flask import Flask, render_template, request, jsonify
import mysql.connector
import json
import os
from dotenv import load_dotenv 

app = Flask(__name__)

# Load variables from the .env file
load_dotenv()

def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get("DB_HOST"),
        user=os.environ.get("DB_USER"),
        password=os.environ.get("DB_PASSWORD"),
        database=os.environ.get("DB_NAME")
    )

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search_publishers', methods=['POST'])
def search_publishers():
    search_term = request.form.get('search_term', '')
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Search by both ID and name
    query = """
        SELECT *
        FROM publishers
        WHERE id = %s OR name LIKE %s
        ORDER BY name
        LIMIT 100
    """
    cursor.execute(query, (search_term, f'%{search_term}%'))
    publishers = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify(publishers)

@app.route('/get_widgets/<publisher_id>')
def get_widgets(publisher_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Get widgets for the publisher with all fields
    query = """
        SELECT w.*, pwm.priority, pwm.type as map_type, pwm.status as map_status
        FROM widgets_1 w
        JOIN publishers_widgets_1_map pwm ON w.id = pwm.widgets_1_id
        WHERE pwm.publisher_id = %s
        ORDER BY pwm.priority
    """
    cursor.execute(query, (publisher_id,))
    widgets = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify(widgets)

@app.route('/get_widget_details/<widget_id>')
def get_widget_details(widget_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Get widget elements with all fields
    query = """
        SELECT *
        FROM widgets_element
        WHERE widgets_1_id = %s
        ORDER BY `order`
    """
    cursor.execute(query, (widget_id,))
    elements = cursor.fetchall()
    
    # If no elements found, check widget_carousel
    if not elements:
        query = """
            SELECT *, w.lobby_id AS entity_id,t.name as name
FROM widget_carousel AS w
INNER JOIN tournaments AS t ON t.id = w.lobby_id
WHERE w.widgets_1_id = %s
ORDER BY w.priority;

        """
        cursor.execute(query, (widget_id,))
        elements = cursor.fetchall()
        
        # Mark these as carousel elements
        for element in elements:
            element['is_carousel'] = True
    
    # Get API details
    api_query = """
        SELECT *
        FROM widgets_apis
        WHERE widget_1_id = %s
    """
    cursor.execute(api_query, (widget_id,))
    api_details = cursor.fetchall()
    
    # Format JSON data in api_details
    for api in api_details:
        if api.get('data_api_params'):
            try:
                api['data_api_params'] = json.loads(api['data_api_params'])
            except:
                api['data_api_params'] = api['data_api_params']
        
        # Handle other JSON fields if they exist
        for field in ['metadata']:
            if api.get(field):
                try:
                    api[field] = json.loads(api[field])
                except:
                    pass
    
    # Get related entity details based on element type
    for element in elements:
        # Format any JSON fields
        for field in ['metadata']:
            if element.get(field):
                try:
                    element[field] = json.loads(element[field])
                except:
                    pass
        
        if element.get('type') == 1 and element.get('entity_id'):  # Tournament
            query = """
                SELECT *
                FROM tournaments
                WHERE id = %s
            """
            cursor.execute(query, (element['entity_id'],))
            tournament = cursor.fetchone()
            if tournament:
                element['entity_details'] = tournament
        elif element.get('type') == 3 and element.get('entity_id'):  # Video
            query = """
                SELECT *
                FROM videos
                WHERE id = %s
            """
            cursor.execute(query, (element['entity_id'],))
            video = cursor.fetchone()
            if video:
                element['entity_details'] = video
            else:
                element['entity_details'] = {'id': element['entity_id'], 'type': 'Video'}
        elif element.get('type') == 5 and element.get('entity_id'):  # Show
            query = """
                SELECT *
                FROM shows
                WHERE id = %s
            """
            cursor.execute(query, (element['entity_id'],))
            show = cursor.fetchone()
            if show:
                element['entity_details'] = show
            else:
                element['entity_details'] = {'id': element['entity_id'], 'type': 'Show'}
    
    cursor.close()
    conn.close()
    
    result = {
        'elements': elements,
        'api_details': api_details
    }
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)