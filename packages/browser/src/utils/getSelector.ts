function parsePath(path) {
    return path
        .reverse()
        .filter((element) => {
            return element !== window && element !== document;
        })
        .map((element) => {
            let selector = element.nodeName.toLowerCase();
            if (element.id) {
                selector += `#${element.id}`;
            } else if (element.className) {
                selector += `.${element.className}`;
            }
            return selector;
        })
        .join(' ');
}

export default function (pathsOrTarget) {
    if (Array.isArray(pathsOrTarget)) {
        return parsePath(pathsOrTarget);
    } else {
        let path = [];
        while (pathsOrTarget) {
            path.push(pathsOrTarget);
            pathsOrTarget = pathsOrTarget.parentNode;
        }
        return parsePath(path);
    }
}
