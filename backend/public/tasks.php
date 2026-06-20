<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataFile = __DIR__ . '/../data/tasks.json';

if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([]));
}

$data = file_get_contents($dataFile);
$tasks = json_decode($data, true);

if (!is_array($tasks)) {
    $tasks = [];
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    echo json_encode($tasks);
    exit();
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);

    $newTask = [
        "id" => time(),
        "title" => $input["title"] ?? "",
        "completed" => false
    ];

    $tasks[] = $newTask;
    file_put_contents($dataFile, json_encode($tasks, JSON_PRETTY_PRINT));

    echo json_encode($newTask);
    exit();
}

if ($method === 'PUT') {
    $input = json_decode(file_get_contents("php://input"), true);

    foreach ($tasks as &$task) {
        if ($task["id"] == $input["id"]) {
            $task["completed"] = $input["completed"];
        }
    }

    file_put_contents($dataFile, json_encode($tasks, JSON_PRETTY_PRINT));
    echo json_encode(["message" => "Task updated"]);
    exit();
}

if ($method === 'DELETE') {
    $input = json_decode(file_get_contents("php://input"), true);

    $tasks = array_values(array_filter($tasks, function ($task) use ($input) {
        return $task["id"] != $input["id"];
    }));

    file_put_contents($dataFile, json_encode($tasks, JSON_PRETTY_PRINT));
    echo json_encode(["message" => "Task deleted"]);
    exit();
}

http_response_code(405);
echo json_encode(["message" => "Method not allowed"]);