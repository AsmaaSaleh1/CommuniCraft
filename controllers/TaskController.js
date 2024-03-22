// controllers/TaskController.js
const Task = require('../models/Task');
const Project = require('../models/Project');

async function checkTasksAndUpdateProject(projectId) {
    try {
        // Find all tasks for the project
        const tasks = await Task.findAll({ where: { projectID: projectId } });

        let allTasksComplete = true;
        for (const task of tasks) {
            if (task.status !== 'completed') {//completed
                allTasksComplete = false;
                break;
            }
        }

        if (allTasksComplete) {
            // Update the project status to 'completed'
            const project = await Project.findByPk(projectId);
            if (project) {
                project.isCompleted = true;
                await project.save();
            }
        }

        return { success: true, message: 'Tasks checked and project updated if all tasks are complete' };
    } catch (error) {
        return { success: false, message: 'Error checking tasks and updating project status' };
    }
}

module.exports = { checkTasksAndUpdateProject };
