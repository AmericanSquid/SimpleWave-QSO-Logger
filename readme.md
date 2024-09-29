 _____ _                 _       _    _                   _____ _____  _____   _                                   _             _   __ _____  _____   ___   _ 
/  ___(_)               | |     | |  | |                 |  _  /  ___||  _  | | |                                 | |           | | / /|____ |/ _ \ \ / / | | |
\ `--. _ _ __ ___  _ __ | | ___ | |  | | __ ___   _____  | | | \ `--. | | | | | |     ___   __ _  __ _  ___ _ __  | |__  _   _  | |/ /     / / /_\ \ V /| | | |
 `--. \ | '_ ` _ \| '_ \| |/ _ \| |/\| |/ _` \ \ / / _ \ | | | |`--. \| | | | | |    / _ \ / _` |/ _` |/ _ \ '__| | '_ \| | | | |    \     \ \  _  |\ / | | | |
/\__/ / | | | | | | |_) | |  __/\  /\  / (_| |\ V /  __/ \ \/' /\__/ /\ \_/ / | |___| (_) | (_| | (_| |  __/ |    | |_) | |_| | | |\  \.___/ / | | || | \ \_/ /
\____/|_|_| |_| |_| .__/|_|\___| \/  \/ \__,_| \_/ \___|  \_/\_\____/  \___/  \_____/\___/ \__, |\__, |\___|_|    |_.__/ \__, | \_| \_/\____/\_| |_/\_/  \___/ 
                  | |                                                                       __/ | __/ |                   __/ |                                
                  |_|                                                                      |___/ |___/                   |___/                                 
                                                                 
This is a simple QSO logging web application. The application allows the user to log basic QSO data and geocodes the data using the Leaflet API. You will be presented with a map showing pins for the worked stations and a table with the QSO data. You are able to export your data as an ADIF log file to upload to QRZ, LOTW, eQSL, or any other website or application which accepts ADIF files. Be sure to export your log at the end of each session, as you are not able to save your data within the application. This application simply allows for quick logging in a lightweight, user friendly format to be passed off to your logbook of choice.

This package is for individuals who wish to self-host SimpleWave QSO Logger. You do not need this package to use the application. The latest version of SimpleWave QSO Logger is accessible on K3AYV's American Squid server at https://americansquid.com/apps/simplewave.html

Implementation:
• You may add the source files directly to your website or you may run the application via Docker. Be sure that the source files are placed in the same directory. 
• If you choose to use the files directly, you will need to have a web server such as NGINX or Apache. If you try to run the files from the user directory, the application will not work. 
• The Docker implementation of this application will create an Apache web server with the source files placed in the web directory.

How to Dockerize:
• Step 1: Navigate to this directory in terminal
• Step 2: Run the following command
	• docker build -t my-apache-site .
• Step 3: Run the following command
	• docker run -dit --name my-running-site -p 8080:80 my-apache-site
• Step 4: Access the application on http://localhost:8080

Planned features:
• QSO Validation via HamQTH or QRZ API

Support:
• If you experience any issues with this program, please contact matthew@americansquid.com

Thanks to N3FJP for the inspiration, friendship and knowledge. Don't use my Java logger, go support Scott's software instead!
Thanks to all of my amateur radio teachers and mentors: N3LPV, N3TRX, KB3IVS, KI7Z, KA3YJM, KC3SVR, K2EJ, N3VEJ and others that I'm sure I forgot to mention.
Without you all, I'd still be trying to work VHF with an aluminum dipole in a tree instead of writing apps for radio operators. Blessings to you all!

73 and Enjoy!
