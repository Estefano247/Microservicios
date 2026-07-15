package com.backend;

import java.util.Map;

public record ErrorResponse(Map<String, String> error) {

}
