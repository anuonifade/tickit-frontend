# Tickit Health Survey - HIPAA-Compliant Mental Health Survey Application

This frontend application is part of the Tickit Health Survey system, a HIPAA-compliant mental health survey platform built with React, TypeScript, and Material UI. It communicates with a Ruby on Rails API backend that handles secure data storage and processing.

## HIPAA Compliance Features

### Data Security
- All sensitive health data is transmitted securely via HTTPS
- JWT-based authentication for admin access
- Role-based access controls (super admin vs. regular admin)
- No PHI (Protected Health Information) is stored in local storage or cookies

### User Interface
- Clear separation between public survey forms and admin dashboard
- Comprehensive audit logging of all admin actions
- Data minimization in analytics displays
- Secure survey flagging system for clinical review

### Admin Dashboard
- HIPAA compliance monitoring
- Patient management with encrypted data
- Survey response review with clinical notes
- Audit log access for compliance reporting

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Application Structure

### Public Interface
- **Survey Form**: Allows patients to submit mental health surveys
- **Analytics**: Shows anonymized survey statistics

### Admin Interface
- **Dashboard**: Overview of system activity and HIPAA compliance metrics
- **Patients**: Manage patient records with encrypted PHI
- **Survey Responses**: Review and flag surveys for clinical attention
- **Analytics**: Detailed anonymized data analysis
- **Audit Logs**: Complete audit trail of all system activity (super admin only)

## Getting Started

1. Ensure the backend Rails API is running
2. Configure the API URL in `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:3000/api/v1
   ```
3. Install dependencies: `yarn install`
4. Start the development server: `yarn start`
5. Access the application at http://localhost:3000

## Admin Access

To access the admin interface:
1. Navigate to `/admin` in your browser
2. Log in with credentials provided by your system administrator
3. Super admin accounts have additional access to audit logs and admin management

## HIPAA Compliance Documentation

For detailed information about the HIPAA compliance measures implemented in this application, refer to the `/docs/HIPAA_COMPLIANCE.md` file in the API repository.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
