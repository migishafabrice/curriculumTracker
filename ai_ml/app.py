from flask import Flask, jsonify, request
#from flask_cors import CORS  # 👈 Add this

app = Flask(__name__)

# Allow both GET and POST for testing
@app.route('/add-curriculum', methods=['GET', 'POST'])  # 👈 Explicit methods
def addCurriculum():
    if request.method == 'POST':
        # Get data from Axios POST request
      print("Raw request data:", request.data)  # 👈 Debug raw data
      print("Headers:", request.headers)       # 👈 Check Content-Type
      data = request.get_json()
      print("Parsed JSON:", data)  # Should now show your data
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)