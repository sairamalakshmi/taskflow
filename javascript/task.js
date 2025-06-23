const fs = require('fs');
const path = require('path');

// File paths
const TASK_FILE = path.join(__dirname, 'task.txt');
const COMPLETED_FILE = path.join(__dirname, 'completed.txt');

// Helper functions
function readTasks() {
  try {
    const data = fs.readFileSync(TASK_FILE, 'utf8');
    return data.trim().split('\n').filter(line => line.trim()).map(line => {
      const match = line.match(/^(\d+)\s+(.+)$/);
      return match ? { priority: parseInt(match[1]), text: match[2] } : null;
    }).filter(task => task);
  } catch (err) {
    return [];
  }
}

function readCompletedTasks() {
  try {
    const data = fs.readFileSync(COMPLETED_FILE, 'utf8');
    return data.trim().split('\n').filter(line => line.trim());
  } catch (err) {
    return [];
  }
}

function writeTasks(tasks) {
  const content = tasks.map(task => `${task.priority} ${task.text}`).join('\n');
  fs.writeFileSync(TASK_FILE, content + (content ? '\n' : ''));
}

function writeCompletedTasks(completedTasks) {
  const content = completedTasks.join('\n');
  fs.writeFileSync(COMPLETED_FILE, content + (content ? '\n' : ''));
}

function sortTasksByPriority(tasks) {
  return tasks.sort((a, b) => a.priority - b.priority);
}

// Command implementations
function showUsage() {
  const usage = `Usage :-
$ ./task add 2 hello world    # Add a new item with priority 2 and text "hello world" to the list
$ ./task ls                   # Show incomplete priority list items sorted by priority in ascending order
$ ./task del INDEX            # Delete the incomplete item with the given index
$ ./task done INDEX           # Mark the incomplete item with the given index as complete
$ ./task help                 # Show usage
$ ./task report               # Statistics`;
  console.log(usage);
}

function addTask(args) {
  if (args.length === 0) {
    console.log('Error: Missing tasks string. Nothing added!');
    return;
  }
  
  const input = args.join(' ');
  const match = input.match(/^(\d+)\s+(.+)$/);
  
  if (!match) {
    console.log('Error: Missing tasks string. Nothing added!');
    return;
  }
  
  const priority = parseInt(match[1]);
  const text = match[2].replace(/^"(.*)"$/, '$1'); // Remove quotes if present

  const priotityexists = readTasks().some(task => task.priority === priority);
  if (priotityexists) {
    console.log(`Error: priority ${priority} already exists. Nothing added!`);
    return;
  }
  
  const tasks = readTasks();
  tasks.push({ priority, text });
  writeTasks(tasks);
  
  console.log(`Added task: "${text}" with priority ${priority}`);
}

function listTasks() {
  const tasks = readTasks();
  
  if (tasks.length === 0) {
    console.log('There are no pending tasks!');
    return;
  }
  
  const sortedTasks = sortTasksByPriority(tasks);
  sortedTasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task.text} [${task.priority}]`);
  });
}

function deleteTask(args) {
  if (args.length === 0) {
    console.log('Error: Missing NUMBER for deleting tasks.');
    return;
  }
  
  const index = parseInt(args[0]);
  const tasks = readTasks();
  const sortedTasks = sortTasksByPriority(tasks);
  
  if (index < 1 || index > sortedTasks.length) {
    console.log(`Error: task with index #${index} does not exist. Nothing deleted.`);
    return;
  }
  
  const taskToDelete = sortedTasks[index - 1];
  const originalIndex = tasks.findIndex(task => 
    task.priority === taskToDelete.priority && task.text === taskToDelete.text
  );
  
  tasks.splice(originalIndex, 1);
  writeTasks(tasks);
  
  console.log(`Deleted task #${index}`);
}

function markTaskDone(args) {
  if (args.length === 0) {
    console.log('Error: Missing NUMBER for marking tasks as done.');
    return;
  }
  
  const index = parseInt(args[0]);
  const tasks = readTasks();
  const sortedTasks = sortTasksByPriority(tasks);
  
  if (index < 1 || index > sortedTasks.length) {
    console.log(`Error: no incomplete item with index #${index} exists.`);
    return;
  }
  
  const taskToComplete = sortedTasks[index - 1];
  const originalIndex = tasks.findIndex(task => 
    task.priority === taskToComplete.priority && task.text === taskToComplete.text
  );
  
  // Add to completed tasks
  const completedTasks = readCompletedTasks();
  completedTasks.push(taskToComplete.text);
  writeCompletedTasks(completedTasks);
  
  // Remove from pending tasks
  tasks.splice(originalIndex, 1);
  writeTasks(tasks);
  
  console.log('Marked item as done.');
}

function showReport() {
  const tasks = readTasks();
  const completedTasks = readCompletedTasks();
  const sortedTasks = sortTasksByPriority(tasks);
  
  console.log(`Pending : ${tasks.length}`);
  if (tasks.length > 0) {
    sortedTasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.text} [${task.priority}]`);
    });
  }
  
  console.log(`\nCompleted : ${completedTasks.length}`);
  if (completedTasks.length > 0) {
    completedTasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task}`);
    });
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'add':
      addTask(args.slice(1));
      break;
    case 'ls':
      listTasks();
      break;
    case 'del':
      deleteTask(args.slice(1));
      break;
    case 'done':
      markTaskDone(args.slice(1));
      break;
    case 'help':
      showUsage();
      break;
    case 'report':
      showReport();
      break;
    default:
      showUsage();
      break;
  }
}

main();